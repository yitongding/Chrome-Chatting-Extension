var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
	name: String,
	host: String,

	messages: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	}]
}, {
	timestamps: true
});

mongoose.model('Room', RoomSchema);