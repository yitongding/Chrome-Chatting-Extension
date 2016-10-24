var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
	name: String,
	host: String,
	last_modify: {
		type: Date,
		default: Date.now
	},
	messages: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	}]
});
/*
RoomSchema.pre('save', function(next) {
	var self = this;
	UserModel.find({
		name: self.name
	}, function(err, docs) {
		if (!docs.length) {
			next();
		} else {
			console.log('room exists: ', self.name);
			next(new Error("Room exists!"));
		}
	});
});
*/

mongoose.model('Room', RoomSchema);