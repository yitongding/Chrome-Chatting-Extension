module.exports = function(io) {
  var app = require('express');
  var router = app.Router();
  var url = null;

  router.get('/', function(req, res, next) {
    url = req.param('url');
    res.render('index', {
      title: 'Chat'
    });
  });

  io.sockets.on('connection', function(socket) {
    // connection test
    socket.emit('socketToMe', "connection established");

    socket.username = "tmp";
    // add user to room based on url
    var room = url;
    socket.room = room;
    socket.join(room);
    io.to(room).emit('new member', {
      username: socket.username
    });
    console.log("new user: <" + socket.username + ">join room <" + url + ">");


    // get new username
    socket.on('new user', function(username) {
      console.log("newUser: " + username);
      socket.username = username;
    });

    // When new message come in
    socket.on('new message', function(data) {
      console.log("user: " + socket.username + " message: " + data); // log it to the Node.JS output
      // We tell the client to execute 'new message'
      var room = socket.room;

      io.to(room).emit('new message', {
        username: socket.username,
        message: data
      });
    });


    socket.on('disconnect', function() {
      var room = socket.room;
      var username = socket.username;
      io.to(room).emit('member left', {
        username: username
      });
    });

  });

  return router;
}