// Controller for the coming message
function ChatMsgCtrl($scope, $rootScope, $routeParams, socket, lastTenMsg, topFiveMsg, ezfb) {
	$rootScope.room = encodeURIComponent($routeParams.room);
	$scope.blockList = [];
	$scope.alerts = [];
	$scope.topFiveCollapsed = true;
	$scope.lastTenMsg = lastTenMsg.get({
		room: $routeParams.room
	});
	$scope.messages = [];

	$scope.topFives = topFiveMsg.get({
		room: $routeParams.room
	});
/*
	socket.on('established', function(data) {
		console.log(data);
		console.log("user url:" + $routeParams.room);
		socket.emit('room url', $routeParams.room);
	});
	*/

	socket.on('new message', function(data) {
		if ($scope.blockList.indexOf(data.FBid) == -1) {
			$scope.messages.push(data);
		}
	});

	socket.on("likeMsg", function(message) {
		var idx = $scope.messages.findIndex(function(el) {
			if (el._id == message._id) return true;
			else return false;
		});
		if (idx != -1)
			$scope.messages[idx].upvotes = message.upvotes;
		idx = $scope.lastTenMsg.findIndex(function(el) {
			if (el._id == message._id) return true;
			else return false;
		});
		if (idx != -1)
			$scope.lastTenMsg[idx].upvotes = message.upvotes;

	});

	socket.on("top five", function(messages) {
		$scope.topFives = messages;
	});


	$scope.likeMsg = function(message) {
		message.likeBtn = true;
		var room = $routeParams.room,
			msgId = message._id;
		var likeObj = {
			room: room,
			msgId: msgId
		};
		socket.emit('likeMsg', likeObj);
	};

	$scope.block = function(message) {
		message.blockBtn = true;
		var FBid = message.FBid;
		$scope.blockList.push(FBid);
		var msg = "That user has been added to your block list.!";
		var type = "success";
		if (FBid == 0) {
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

			if ($('.anonymousCheckbox').is(':checked'))
				var anonymous = true;
			else
				var anonymous = false;

			var message = {
				text: text,
				anonymous: anonymous
			}

			socket.emit('new message', message);
		}
	}


	$(window).keydown(function(event) {
		// When the client hits ENTER on their keyboard 
		if (event.which === 13) {
			sendMessage();
		}

	});
}


function ChatHistoryCtrl($scope, $routeParams, historyMsg) {
	$scope.messages = historyMsg.get({
		room: $routeParams.room
	});

	$scope.back = function() {
		window.history.back();
	}
}

// Controller for an individual poll
function PollCtrl($scope, $routeParams, socket, Poll) {
	$scope.poll = Poll.get({
		room: $routeParams.room,
		pollId: $routeParams.pollId
	});

	$scope.$watch("poll", function(newValue, oldValue, scope) {
		//console.log(scope.poll);
		var choices = $scope.poll.choices;
		if (choices) {
			$scope.chartLabels = choices.map(function(choice) {
				return choice.text;
			});
			$scope.chartData = choices.map(function(choice) {
				return choice.counts;
			});
		}
	}, true);


	socket.on('myvote', function(data) {
		if ($scope.poll._id === data._id) {
			$scope.poll.userVoted = data.userVoted;
			$scope.poll.userChoice = data.userChoice;
		}
	});

	socket.on('vote', function(data) {
		if ($scope.poll._id === data._id) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}
	});

	socket.on('close vote', function(data) {
		if (data == $scope.poll._id) {
			$scope.poll.closed = true;
		}
	});

	socket.on('open vote', function(data) {
		if (data == $scope.poll._id) {
			$scope.poll.closed = false;
		}
	});

	$scope.vote = function(poll) {
		var pollId = poll._id,
			choiceId = poll.userVote;

		if (choiceId) {
			var voteObj = {
				poll_id: pollId,
				choice: choiceId
			};
			socket.emit('vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};

	$scope.closePoll = function(poll) {
		var pollId = poll._id;
		socket.emit("close poll", pollId);
	};

	$scope.openPoll = function(poll) {
		var pollId = poll._id;
		socket.emit("open poll", pollId);
	};
};


function PollListCtrl($scope, $routeParams, Poll) {
	$scope.room = $routeParams.room;
	$scope.polls = Poll.query({
		room: $routeParams.room
	});
};

// Controller for creating a new poll
function NewPollCtrl($scope, $location, $routeParams, Poll) {
	// Define an empty poll model object
	$scope.poll = {
		question: '',
		choices: [{
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
						$location.path('polls/' + $routeParams.room);
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
};

function TopfiveCtrl($scope, $location, $routeParams, socket, topFiveMsg) {
	$scope.topFives = topFiveMsg.get({
		room: $routeParams.room
	});

	socket.on("likeMsg", function(message) {
		var idx = $scope.messages.findIndex(function(el) {
			if (el._id == message._id) return true;
			else return false;
		});
		if (idx != -1)
			$scope.messages[idx].upvotes = message.upvotes;
		idx = $scope.lastTenMsg.findIndex(function(el) {
			if (el._id == message._id) return true;
			else return false;
		});
		if (idx != -1)
			$scope.lastTenMsg[idx].upvotes = message.upvotes;

	});

	socket.on("top five", function(messages) {
		$scope.topFives = messages;
	});


	$scope.likeMsg = function(message) {
		message.likeBtn = true;
		var room = $routeParams.room,
			msgId = message._id;
		var likeObj = {
			room: room,
			msgId: msgId
		};
		socket.emit('likeMsg', likeObj);
	};
}

angular.module('chatApp').controller('NavbarCtrl',
	function NavbarCtrl($scope, $rootScope, $routeParams, socket, ezfb) {
		$scope.isNavCollapsed = true;
		// $scope.room = $routeParams.room;

		socket.on('established', function(data) {
			console.log(data);
			console.log("user url:" + $routeParams.room);
			socket.emit('room url', $routeParams.room);
		});

		updateLoginStatus(updateApiMe);

		$scope.FBlogin = function() {
			ezfb.login(function(res) {
				if (res.authResponse) {
					updateLoginStatus(updateApiMe);
				}
			}, {
				scope: 'public_profile'
			});
		}

		$scope.FBlogout = function() {
			ezfb.logout(function() {
				updateLoginStatus(updateApiMe);
			});
		};

		// var watchList = ['FBloginStatus', 'FBapiMe'];
		// angular.forEach(watchList, function(varName) {
		// 	$rootScope.$watch(varName, function(val) {
		// 		$rootScope.$broadcast("");
		// 	}, true);
		// });

		// Update loginStatus result
		function updateLoginStatus(more) {
			ezfb.getLoginStatus(function(res) {
				$rootScope.FBloginStatus = res;

				(more || angular.noop)();
			});
		}

		// Update api('/me') result
		function updateApiMe() {
			ezfb.api('/me', function(res) {
				$rootScope.FBapiMe = res;
				socket.emit("FBlogin", {
					name: res.name,
					id: res.id
				});
			});
		}

	});