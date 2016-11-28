module.exports = function (io) {
  var app = require('express');
  var router = app.Router();

  var mongoose = require('mongoose');
  var Room = mongoose.model('Room');
  var Message = mongoose.model('Message');
  var Poll = mongoose.model('Poll');

  var roomUrl = null; // needed to change the socket.room
  var roomObj = null; // needed to create a message object\
  var ip = null;
  var FBid = null;

  var fetchLastTen = function (res, room) {
    var newRoomObj = {
      name: room,
      host: null
    };

    Room.findOneAndUpdate({
      name: room
    }, newRoomObj, {
      upsert: true,
      new: true
    }).populate('messages').exec(function (err, newRoom) {
      if (err) console.log(err);
      roomObj = newRoom; // room object for message storage

      // send last 10 chat history to the new user
      res.json(newRoom.messages.slice(-10));
    });
  };

  var fetchTopFive = function (res, room, socket) {
    Message.find({
        room: roomObj
      })
      .sort('-upvotes')
      .exec(function (err, messages) {
        if (socket)
          socket.emit("top five", messages.slice(0, 5));
        // res.json(messages.slice(0, 5));
        if (res)
          res.json(messages.slice(0, 5));
      });
  };


  var fetchHistory = function (res, room, socket) {
    Room.findOne({
      name: room
    }).populate('messages').exec(function (err, room) {
      if (err || !room) {
        console.log(err);
        res.json({
          err: "No message in the room"
        });
      } else {
        res.json(room.messages);
      }
    });
  }


  var fetchPoll = function (res, room, pollId) {
    Poll.findById(pollId, function (err, poll) {
      if (err || !poll) {
        console.log(err);
        res.json({
          err: "No poll in the room"
        });
      } else {
        var tmppoll = poll.toObject();
        tmppoll.userVoted = false;
        tmppoll.choices.forEach(function (choice, choiceIdx) {
          choice.votes.forEach(function (vote, voteIdx) {
            if (vote.ip == ip) {
              tmppoll.userChoice = {
                _id: choice._id,
                text: choice.text
              }
              tmppoll.userVoted = true;
            }
            delete tmppoll.choices[choiceIdx].votes;
          });
        });
        res.json(tmppoll);
      }
    });
    // Room.findOne({
    //   name: room
    // }).populate('polls').exec(function (err, room) {
    //   if (err || !room) {
    //     console.log(err);
    //     res.json({
    //       err: "No poll in the room"
    //     });
    //   } else {
    //     var polls = room.polls.map(function (poll) {
    //       var tmppoll = poll.toObject();
    //       tmppoll.userVoted = false;
    //       tmppoll.choices.forEach(function (choice, choiceIdx) {
    //         choice.votes.forEach(function (vote, voteIdx) {
    //           if (vote.ip == ip) {
    //             tmppoll.userChoice = {
    //               _id: choice._id,
    //               text: choice.text
    //             }
    //             tmppoll.userVoted = true;
    //           }
    //           delete tmppoll.choices[choiceIdx].votes;
    //         });
    //       });
    //       return tmppoll;
    //     });
    //     res.json(polls);
    //   }
    // });
  }


  var createPoll = function (req, res, room) {
    var reqBody = req.body,
      // Filter out choices with empty text
      choices = reqBody.choices.filter(function (v) {
        return v.text != '';
      }),
      // Build up poll object to save
      pollObj = {
        question: reqBody.question,
        choices: choices,
        room: roomObj,
        host: FBid
      };
    console.log(pollObj);
    // Create poll model from built up poll object
    var poll = new Poll(pollObj);

    // Save poll to DB
    poll.save(function (err, doc) {
      if (err || !doc) {
        throw 'Error';
      } else {
        roomObj.polls.push(poll);
        roomObj.save(function (err, roomObj) {
          res.json(doc);
        });
      }
    });
  }


  var fetchPollsList = function (res, room) {
    Poll.find({
      room: roomObj
    }, 'question', function (err, polls) {
      res.json(polls);
    });
  };

  router.get('/chat/lastTen/:room', function (req, res, next) {
    var room = decodeURIComponent(req.params.room);
    fetchLastTen(res, room);
  });

  router.get('/chat/topFive/:room', function (req, res, next) {
    var room = decodeURIComponent(req.params.room);
    fetchTopFive(res, room, null);
  });

  router.get('/chat/:room', function (req, res, next) {
    roomUrl = decodeURIComponent(req.params.room);
    res.json();
  });

  router.get('/chat/', function (req, res, next) {
    roomUrl = '54.213.44.54:3000';
    res.json();
  });

  router.get('/history/:room', function (req, res, next) {
    var room = decodeURIComponent(req.params.room);
    if (typeof room == undefined) {
      room = "54.213.44.54:3000";
    }
    fetchHistory(res, room);
  });

  router.get('/polls/:room/polls', function (req, res, next) {
    var room = decodeURIComponent(req.params.room);
    fetchPollsList(res, room);
  });

  router.get('/polls/:room/:poll', function (req, res, next) {
    var room = decodeURIComponent(req.params.room),
      poll = decodeURIComponent(req.params.poll);
    fetchPoll(res, room, poll);
  });



  router.post('/polls', function (req, res, next) {
    createPoll(req, res);
  });

  router.get('/', function (req, res, next) {
    res.render('index');
  });



  io.sockets.on('connection', function (socket) {

    // send estabilish message on connection
    socket.emit('established', "connection established");

    socket.on("room url", function (room) {
      socket.room = room;
      console.log("user join room <"+room+">");
      socket.join(room);
      ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
    });

    socket.on("FBlogin", function (data) {
      socket.username = data.name;
      socket.FBid = data.id;
      FBid = data.id;
      console.log("user: <" + socket.id + "> login with FB <" + data.name + ">");
    });


    socket.on('new message', function (message) {
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

      messageObj.save(function (err) {
        if (err) console.log(err);
        roomObj.messages.push(messageObj);
        roomObj.save(function (err, roomObj) {
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


    socket.on('likeMsg', function (data) {
      Message.findById(
        data.msgId,
        function (err, message) {
          if (err) console.log(err);
          message.upvote(function () {
            console.log('user <' + socket.username + '> liked <' + message.message + '>');
            io.to(socket.room).emit('likeMsg', message);
            fetchTopFive(null, socket.room, socket);
          });
        });
    });

    socket.on('vote', function (data) {
      Poll.findById(data.poll_id, function (err, poll) {

        poll.upvote(data.choice, ip, function () {
          var choice = poll.choices.id(data.choice);
          var myvote = {
            _id: poll._id,
            userVoted: true,
            userChoice: {
              _id: choice._id,
              text: choice.text
            }
          };
          Poll.findById(data.poll_id, function (err, poll) {
            var tmppoll = poll.toObject();
            tmppoll.userVoted = false;
            tmppoll.choices.forEach(function (choice, choiceIdx) {
              choice.votes.forEach(function (vote, voteIdx) {
                if (vote.ip == ip) {
                  tmppoll.userChoice = {
                    _id: choice._id,
                    text: choice.text
                  }
                  tmppoll.userVoted = true;
                }
              });
              delete tmppoll.choices[choiceIdx].votes;
            });
            socket.emit('myvote', myvote);
            socket.to(socket.room).emit('vote', tmppoll);
          });
        });
      });
    });


    socket.on("close vote", function(pollId) {
      Poll.findById(pollId, function(errr, poll) {
        poll.closed = true;
        poll.save(function(err){
          if (err) console.log(err);
          socket.to(socket.room).emit("close vote", pollId);
        });
      });
    });

    socket.on("open vote", function(pollId) {
      Poll.findById(pollId, function(err, poll){
        poll.closed = false;
        poll.save(function(err) {
          if (err) console.log(err);
          socket.to(socket.room).emit("open vote", pollId);
        });
      });
    });

  });

  return router;
}