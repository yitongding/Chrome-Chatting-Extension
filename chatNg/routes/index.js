module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  var mongoose = require('mongoose');
  var Room = mongoose.model('Room');
  var Message = mongoose.model('Message');

  var roomUrl = null; // needed to change the socket.room
  var roomObj = null; // needed to create a message object

  var fetchLastTen = function(res, room) {
    var newRoomObj = {
      name: room,
      host: null
    };

    Room.findOneAndUpdate({
      name: room
    }, newRoomObj, {
      upsert: true,
      new: true
    }).populate('messages').exec(function(err, newRoom) {
      if (err) console.log(err);
      roomObj = newRoom; // room object for message storage

      // send last 10 chat history to the new user
      res.json(newRoom.messages.slice(-10));
    });
  };

  var fetchTopFive = function(res, room, socket) {
    Message.find({
        room: roomObj
      })
      .sort('-upvotes')
      .exec(function(err, messages) {
        if (socket)
          socket.emit("top five", messages.slice(0, 5));
        // res.json(messages.slice(0, 5));
        if (res)
          res.json(messages.slice(0, 5));
      });
  };


  var fetchHistory = function(res, room, socket) {
    Room.findOne({
      name: name
    }).populate('messages').exec(function(err, room) {
      if (err || !room) {
        console.log(err);
        res.json({
          err: "No message in the room"
        });
      } else {
        res.json({
          err: false,
          messages: room.messages,
        });
      }
    });
  }


  router.get('/chat/lastTen/:room', function(req, res, next) {
    var room = req.params.room;
    fetchLastTen(res, room);
  });

  router.get('/chat/topFive/:room', function(req, res, next) {
    var room = req.params.room;
    fetchTopFive(res, room, null);
  });

  router.get('/chat/:room', function(req, res, next) {
    roomUrl = req.params.room;
    res.json();
  });

  router.get('/chat/', function(req, res, next) {
    roomUrl = '54.213.44.54:3000';
    res.json();
  });

  router.get('/history/:room', function(req, res, next) {
    var room = req.params.room;
    if (typeof room == undefined) {
      room = "54.213.44.54:3000";
    }
    fetchHistory(res, room);
  });

  router.get('/', function(req, res, next) {
    res.render('index');
  });



  io.sockets.on('connection', function(socket) {

    // send estabilish message on connection
    socket.emit('established', "connection established");

    socket.on("room url", function(room) {
      socket.room = room;
      socket.join(room);
    });

    socket.on("FBlogin", function(data) {
      socket.username = data.name;
      socket.FBid = data.id;
      console.log("user: <" + socket.id + "> login with FB <" + data.name + ">");
    });


    socket.on('new message', function(message) {
      // log it to the Node.JS output
      console.log("user <" + socket.username + "> message <" + message.text + "> in room <" + socket.room + ">");

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
          console.log('ready to send message');
          console.log(username + ' in ' + socket.room);
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


    socket.on('likeMsg', function(data) {
      Message.findById(
        data.msgId,
        function(err, message) {
          if (err) console.log(err);
          message.upvote(function() {
            console.log('user <' + socket.username + '> liked <' + message.message + '>');
            io.to(socket.room).emit('likeMsg', message);
            fetchTopFive(null, socket.room, socket);
          });
        });
    });

  });

  return router;
}