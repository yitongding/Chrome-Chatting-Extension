// Controller for the coming message
function ChatMsgCtrl($scope, $routeParams, socket, Message) {
	$scope.blockList = [];
	$scope.messages = Message.get({
		room: $routeParams.room
	});

	$scope.topFives = Message.top({
		room: $routeParams.room
	});
	// need to add system notice of chat history

	socket.on('new message', function(data) {
		if ($scope.blockList.indexOf(data.FBid) == -1) {
			$scope.messages.push(data);
		}
	});

	socket.on("topFive", function(data) {
		$scope.topFives = data;
	});

	socket.on("likeMsg", function(message) {
		var idx = $scope.messages.findIndex(function(el) {
			if (el._id == message._id) return true;
			else return false;
		});
		$scope.messages[idx].upvotes = message.upvotes;
	});


	$scope.likeMsg = function(event) {
		var room = $routeParams.room,
			msgId = event.target.id;
		var likeObj = {
			room: room,
			msgId: msgId
		};
		socket.emit('likeMsg', likeObj);
	};

	$scope.block = function(event) {
		var FBid = event.target.id;
		$scope.blockList.push(FBid);
		var msg = "That user has been added to your block list.!";
		var type = "success";
		if (Fbid == 0) {
			msg = "NOTE: all anonyous message has been blocked.";
			type = "warning";
		}
		$scope.alerts.push({
			msg: msg,
			type: type
		});
	};

	$scope.closeAlert = function() {
		$scope.alerts.splice(index, 1);
	};

	$scope.undoBlock = function() {
		$scope.alerts.splice(index, 1);
		$scope.blockList.pop();
		$scope.alerts.push({
			msg: "Undo success!",
			type: "success"
		});
	};


	function sendMessage() {
		var text = $('.inputMessage').val();
		// Prevent markup from being injected into the message
		if (text) {
			// if there is a non-empty message
			$('.inputMessage').val('');

			if ($('.anonyousCheckbox').checked)
				var anonyous = true;
			else
				var anonyous = false;

			var message = {
				text: text,
				anonyous: anonyous
			}

			socket.emit('new message', message);
		}
	}

	$window.keydown(function(event) {
		// When the client hits ENTER on their keyboard 
		if (event.which === 13) {
			sendMessage();
		}
	});


}


function ChatHistoryCtrl($scope, $routeParams, Message) {
	$scope.messages = Message.his({
		room: $routeParams.room
	});

	$scope.back = function() {
		window.history.back();
	}
}

/*
// Controller for an individual poll
function PollItemCtrl($scope, $routeParams, socket, Poll) {
	$scope.poll = Poll.get({
		pollId: $routeParams.pollId
	});

	socket.on('myvote', function(data) {
		console.dir(data);
		if (data._id === $routeParams.pollId) {
			$scope.poll = data;
		}
	});

	socket.on('vote', function(data) {
		console.dir(data);
		if (data._id === $routeParams.pollId) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}
	});

	$scope.vote = function() {
		var pollId = $scope.poll._id,
			choiceId = $scope.poll.userVote;

		if (choiceId) {
			var voteObj = {
				poll_id: pollId,
				choice: choiceId
			};
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};
}

// Controller for creating a new poll
function PollNewCtrl($scope, $location, Poll) {
	// Define an empty poll model object
	$scope.poll = {
		question: '',
		choices: [{
			text: ''
		}, {
			text: ''
		}, {
			text: ''
		}]
	};

	// Method to add an additional choice option
	$scope.addChoice = function() {
		$scope.poll.choices.push({
			text: ''
		});
	};

	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		var poll = $scope.poll;

		// Check that a question was provided
		if (poll.question.length > 0) {
			var choiceCount = 0;

			// Loop through the choices, make sure at least two provided
			for (var i = 0, ln = poll.choices.length; i < ln; i++) {
				var choice = poll.choices[i];

				if (choice.text.length > 0) {
					choiceCount++
				}
			}

			if (choiceCount > 1) {
				// Create a new poll from the model
				var newPoll = new Poll(poll);

				// Call API to save poll to the database
				newPoll.$save(function(p, resp) {
					if (!p.error) {
						// If there is no error, redirect to the main view
						$location.path('polls');
					} else {
						alert('Could not create poll');
					}
				});
			} else {
				alert('You must enter at least two choices');
			}
		} else {
			alert('You must enter a question');
		}
	};
}
*/