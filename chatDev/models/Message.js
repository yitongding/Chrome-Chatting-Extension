var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: {
    type: Date,
    default: Date.now
  },
  upvotes: {
    type: Number,
    default: 0
  },
  room: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
});

MessageSchema.methods.upvote = function(callback) {
  this.upvotes += 1;
  this.save(callback);
};

mongoose.model('Message', MessageSchema);