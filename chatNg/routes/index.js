//var mongoose = require('mongoose');
var mongoose = require('mongoose');
require('../models/Room');
require('../models/Message');
mongoose.connect('mongodb://localhost:27017/chromeChat');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');
var roomObj = null; // room object for message storage

function findTopFive(room) {
	Message.find({
			room: room
		})
		.sort('-upvotes')
		.exec(function(err, messages) {
			io.to(socket.room).emit('top five', messages.slice(0, 5));
		});
}

exports.index = function(req, res) {
	res.render('index');
};

exports.messages = function(req, res) {
	var room = res.params.room;


	// Message.his method, return all chat history of the room
	if (res.params.his) {
		Room.findOne({
			name: room
		}).populate('messages').exec(function(err, room) {
			if (err || !room) {
				res.json({
					err: "No history message."
				});
			} else {
				res.json(room.messages);
			}
		});
	} else {
		// create a new room in database if room does not exist.
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
			findTopFive(newRoom);
			// send last 10 chat history to the new user
			res.json(newRoom.messages.slice(-10));
		});
	}
};


exports.chat = function(req, res) {
	var room = req.params.room;
	socket.room = room;

	socket.on("FBlogin", function(data) {
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


	socket.on('likeMsg', function(data) {
		//console.log(data);
		Message.findById(
			data,
			function(err, message) {
				if (err) console.log(err);
				message.upvote(function() {
					console.log('user <' + socket.username + '> liked <' + message.message + '>');
					io.to(socket.room).emit('likeMsg', message);
					findTopFive(message.room);
				});
			});
	});

};


/*

// Connect to MongoDB using Mongoose
var mongoose = require('mongoose');
var db;
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp');
}

// Get Poll schema and model
var PollSchema = require('../models/Poll.js').PollSchema;
var Poll = db.model('polls', PollSchema);

// Main application view
exports.index = function(req, res) {
	res.render('index');
};

// JSON API for list of polls
exports.list = function(req, res) {
	// Query Mongo for polls, just get back the question text
	Poll.find({}, 'question', function(error, polls) {
		res.json(polls);
	});
};

// JSON API for getting a single poll
exports.poll = function(req, res) {
	// Poll ID comes in the URL
	var pollId = req.params.id;
	
	// Find the poll by its ID, use lean as we won't be changing it
	Poll.findById(pollId, '', { lean: true }, function(err, poll) {
		if(poll) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;

			// Loop through poll choices to determine if user has voted
			// on this poll, and if so, what they selected
			for(c in poll.choices) {
				var choice = poll.choices[c]; 

				for(v in choice.votes) {
					var vote = choice.votes[v];
					totalVotes++;

					if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
						userVoted = true;
						userChoice = { _id: choice._id, text: choice.text };
					}
				}
			}

			// Attach info about user's past voting on this poll
			poll.userVoted = userVoted;
			poll.userChoice = userChoice;

			poll.totalVotes = totalVotes;
		
			res.json(poll);
		} else {
			res.json({error:true});
		}
	});
};

// JSON API for creating a new poll
exports.create = function(req, res) {
	var reqBody = req.body,
			// Filter out choices with empty text
			choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
			// Build up poll object to save
			pollObj = {question: reqBody.question, choices: choices};
				
	// Create poll model from built up poll object
	var poll = new Poll(pollObj);
	
	// Save poll to DB
	poll.save(function(err, doc) {
		if(err || !doc) {
			throw 'Error';
		} else {
			res.json(doc);
		}		
	});
};

exports.vote = function(socket) {
	socket.on('send:vote', function(data) {
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
		
		Poll.findById(data.poll_id, function(err, poll) {
			var choice = poll.choices.id(data.choice);
			choice.votes.push({ ip: ip });
			
			poll.save(function(err, doc) {
				var theDoc = { 
					question: doc.question, _id: doc._id, choices: doc.choices, 
					userVoted: false, totalVotes: 0 
				};

				// Loop through poll choices to determine if user has voted
				// on this poll, and if so, what they selected
				for(var i = 0, ln = doc.choices.length; i < ln; i++) {
					var choice = doc.choices[i]; 

					for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
						var vote = choice.votes[j];
						theDoc.totalVotes++;
						theDoc.ip = ip;

						if(vote.ip === ip) {
							theDoc.userVoted = true;
							theDoc.userChoice = { _id: choice._id, text: choice.text };
						}
					}
				}
				
				socket.emit('myvote', theDoc);
				socket.broadcast.emit('vote', theDoc);
			});			
		});
	});
};

*/