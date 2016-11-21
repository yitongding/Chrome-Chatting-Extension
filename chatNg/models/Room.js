var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
	name: String,
	host: String,

	messages: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	}],

  polls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }]
}, {
	timestamps: true
});

mongoose.model('Room', RoomSchema);