module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  var mongoose = require('mongoose');
  var Room = mongoose.model('Room');
  var Message = mongoose.model('Message');

  var url = null;
  // var username = 'tmp';

  router.get('/', function(req, res, next) {
    url = req.param('url');
    if (typeof url == 'undefined') {
      url = "54.213.44.54:3000";
    }  
    res.render('index', {
      historyLink: encodeURIComponent(url)
    });
  });

  io.sockets.on('connection', function(socket) {
    // connection test
    socket.emit('established', "connection established");

    // add user to room based on url
    var room = url;
    if (!room) {
      room = "54.213.44.54:3000";
    }
    socket.room = room;
    socket.join(room);

    // update old room or insert new room to DB
    var newRoomObj = {
      name: room,
      host: null
    };

    var roomObj = null;
    Room.findOneAndUpdate({
      name: room
    }, newRoomObj, {
      upsert: true,
      new: true
    }).populate('messages').exec(function(err, newRoom) {
      if (err) console.log(err);
      roomObj = newRoom;
      // sent last 10 chat history to the new user
      // console.log(roomObj);
      socket.emit("last ten history", roomObj.messages.slice(-10));
      findTopFive(newRoom);
    });

    console.log("new user: <" + socket.id + ">join room <" + room + ">");


    // set username to the socket
    // if (!username) {
    //   username = 'anonymous';
    // }
    // socket.username = username;
  
    // If user login with FB, then replace username
    socket.on("FBlogin", function(data) {
      username = data.name;
      socket.username = data.name;
      socket.FBid = data.id;
      console.log("user: <" + socket.id + "> login with FB <" + data.name + ">");
    });


    socket.on('new message', function(message) {
      // log it to the Node.JS output
      console.log("user <" + socket.username + "> message <" + message + "> in room <" + socket.room + ">");

      var text = message.text;
      var username = (message.anonymous) ? "anonymous" : socket.username;
      var FBid = (message.anonymous) ? 0 : socket.FBid;

      // save message to DB
      var messageObj = new Message({
        username: username,
        message: text,
        room: roomObj
      });

      messageObj.save(function(err) {
        if (err) console.log(err);
        roomObj.messages.push(messageObj);
        roomObj.save(function(err, roomObj) {
          if (err) console.log(err);

          // broadcast message to the room
          io.to(socket.room).emit('new message', {
            username: username,
            message: text,
            _id: messageObj._id,
            upvotes: 0,
            FBid: FBid
          });

        });
      });

    });

    function findTopFive(room) {
      Message.find({room: room})
        .sort('-upvotes')
        .exec(function(err, messages) {
          io.to(socket.room).emit('top five', messages.slice(0,5));
        });
    }

    socket.on('upvote', function(data) {
      //console.log(data);
      Message.findById(
        data,
        function(err, message) {
          if (err) console.log(err);
          message.upvote(function() {
            console.log('user <' + socket.username + '> vote on <' + data + '>');
            io.to(socket.room).emit('upvote', message);
            findTopFive(message.room);
          });
        });

    });

  });

  return router;
}
