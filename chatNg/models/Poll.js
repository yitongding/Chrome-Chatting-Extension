var mongoose = require('mongoose');

// Subdocument schema for votes
var voteSchema = new mongoose.Schema({ ip: 'String' });

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({ 
	text: String,
	votes: [voteSchema]
});

// Document schema for polls
var PollSchema = new mongoose.Schema({
	question: { type: String, required: true },
	choices: [choiceSchema],
  room: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: '7d'
  }
});

PollSchema.methods.upvote = function(choiceId, IP, callback) {
  var choice = this.choices.id(choiceId);
  choice.votes.push({ip: IP});
  this.totalVotes += 1;
  this.save(callback);
};

mongoose.model('Poll', PollSchema);