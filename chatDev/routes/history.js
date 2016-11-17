var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');

/* GET users listing. */
router.get('/:room', function(req, res, next) {
  var ref = req.headers.referer;
  console.log(ref);
  var name = req.params.room;
  if (typeof name == undefined) {
    name = "54.213.44.54:3000";
  }
  Room.findOne({name: name}).populate('messages').exec(function(err, room){
    if (err || !room) {
        console.log(err);
        res.render('history', {messages: [{message : 'There is no message in this room'}], ref: ref});
      } else {
        res.render('history', {messages : room.messages, ref: ref});
      }
    });
});

module.exports = router;

