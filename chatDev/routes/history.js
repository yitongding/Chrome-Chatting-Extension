module.exports = function() {
  var app = require('express');
  var router = app.Router();

  var mongoose = require('mongoose');
  var Room = mongoose.model('Room');
  var Message = mongoose.model('Message');

  router.get('/', function(req, res, next) {
    var name = req.param('room');
    Room.findOne({name: name}).exec(function(err, room){
      if (err) {
        console.log(err);
        res.render('history', {messages: 'There is no message in this room'});
      } else {
        res.render('history', {messages : room.messages});
      }
    });
    
  });

  return router;
};