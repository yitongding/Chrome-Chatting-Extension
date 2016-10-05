module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  router.get('/', function(req, res, next) {
    res.render('index', {
      title: 'Express'
    });
  });

  io.sockets.on('connection', function(socket) {
    // connection test
    socket.emit('socketToMe', "connection established");

    // tmp room solution, change to URL later
    /*************************/
    socket.username = "tmp";
    var roomName = "tmp_room";
    socket.currentRoom = roomName;
    socket.join(roomName);
    /*^^^^^^^^^^^^^^^^^^^^^^^*/

    // request client current url on connection to assign the room
    socket.emit('url req', "url request");

    socket.on('url res', function(url) {
      //#### add url decode in the future
      var room = url;
      socket.room = room;
      socket.join(room);
      console.log("new user: <"+socket.username+ ">join room <"+url+">");
      io.to(room).emit('new member', {
        username : socket.username
      });
    });


    // get new username
    socket.on('new user', function(username) {
      console.log("newUser: "+username);
      socket.username = username;
    });

    // When new message come in
    socket.on('new message', function(data) {
      console.log("user: " + socket.username + " message: " + data); // log it to the Node.JS output
      // We tell the client to execute 'new message'
      var room = socket.currentRoom;

      io.to(room).emit('new message', {
        username: socket.username,
        message: data
      });
    });


    socket.on('disconnect', function() {
      var room = socket.room;
      var username = socket.username;
      io.to(socket.currentRoom).emit('member left', {
        username: socket.username
      });
    });

  });

  return router;
}