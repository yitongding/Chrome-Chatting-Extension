module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  var mongoose = require('mongoose');
  var Room = mongoose.model('Room');
  var Message = mongoose.model('Message');

  var url = null;
  var username = 'tmp';

  router.get('/', function(req, res, next) {
    url = req.param('url');
    username = req.param('username');
    res.render('index', {
      historyLink: url
    });
  });

  io.sockets.on('connection', function(socket) {
    // connection test
    socket.emit('established', "connection established");

    // set username to the socket
    if (!username) {
      username = 'anonymous';
    }
    socket.username = username;


    // add user to room based on url
    var room = url;
    if (!room) {
      room = "54.213.44.54:3000";
    }
    socket.room = room;
    socket.join(room);

    // update old room or insert new room to DB
    var newRoomObj = new Room({
      name: room,
      host: socket.username
    });

    var roomObj = null;
    Room.update({
      name: room
    }, newRoomObj, {
      upsert: true,
      new: true
    }, function(err, newRoom) {
      if (err) console.log(err);
      roomObj = newRoom;
      // sent last 10 chat history to the new user
      socket.emit("last ten history", roomObj.comment.slice(-10););
    });

    console.log("new user: <" + socket.username + ">join room <" + room + ">");



    socket.on('new message', function(message) {
      // log it to the Node.JS output
      console.log("user <" + socket.username + "> message <" + message + "> in room <" + socket.room + ">");

      // save message to DB
      var messageObj = new Message({
        username: socket.username,
        message: message,
        room: roomObj
      });

      messageObj.save(function(err) {
        if (err) console.log(err);
        roomObj.messages.push(messageObj);
        roomObj.save(function(err, roomObj) {
          if (err) console.log(err);

          // broadcast message to the room
          io.to(socket.room).emit('new message', {
            username: socket.username,
            message: message,
            id: messageObj._id
          });

        });
      });

    });



    socket.on('upvotes', function(data) {

      Message.findById(
        data.id,
        function(err, message) {
          if (err) console.log(err);
          messgae.upvote(function() {
            socket.emit('upvote success');
            io.to(socket.room).emit('upvote', data);
          });
        });

    });

  });

  return router;
}