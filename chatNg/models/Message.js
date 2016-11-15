var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  upvotes: {
    type: Number,
    default: 0
  },
  room: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  expireAt: {
    type: Date,
    default: Date.now,
    expires: '7d'
  }
}, {
  timestamps: true
});

MessageSchema.methods.upvote = function(callback) {
  this.upvotes += 1;
  this.save(callback);
};

mongoose.model('Message', MessageSchema);