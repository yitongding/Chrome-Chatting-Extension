module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });});

  io.sockets.on('connection', function(socket) { 
    socket.emit("socketToMe", "connection established");
    

    // tmp room solution, change to URL later
    /*************************/ 
    var roomName = "tmp_room";
    socket.currentRoom = roomName;
    socket.join(roomName);
    /*^^^^^^^^^^^^^^^^^^^^^^^*/

    socket.on('new message', function (data) {
      socket.username = "tmp";
      console.log("user: "+socket.username+ " message: "+data); // log it to the Node.JS output
      // We tell the client to execute 'new message'
      var room = socket.currentRoom;

      io.to(room).emit('new message', {
        username: socket.username,
        message: data
      });
    });

  });

  return router;
}
