// Controller for the coming message
function ChatMsgCtrl($scope, $rootScope, $routeParams, socket, lastTenMsg, topFiveMsg, historyMsg) {
	$scope.room = $routeParams.room;
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

	socket.on('established', function(data) {
		console.log(data);
		socket.emit('room url', $routeParams.room);
	});

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

		// $scope.topFives = topFiveMsg.get({
		// 	room: $routeParams.room
		// });
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


angular.module('chatApp').controller('NavbarCtrl', ['$scope', '$rootScope', '$routeParams', 'socket', function NavbarCtrl($scope, $rootScope, $routeParams, socket) {
	$scope.room = $routeParams.room;

	/*****************/
	/* FB login code */
	/*****************/
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s);
		js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=1338404279506042";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// This is called with the results from from FB.getLoginStatus().
	function statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			successAPI();
		} else if (response.status === 'not_authorized') {
			failAPI();
		} else {
			failAPI();
		}
	}

	function checkLoginState() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	window.fbAsyncInit = function() {
		FB.init({
			appId: '{your-app-id}',
			cookie: true, // enable cookies to allow the server to access 
			// the session
			xfbml: true, // parse social plugins on this page
			version: 'v2.5' // use graph api version 2.5
		});

		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});

	};

	// Load the SDK asynchronously
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s);
		js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	function successAPI() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
			socket.emit("FBlogin", {
				name: response.name,
				id: response.id
			});
			// $('.inputMessage').removeAttr('disabled');
			$rootScope.FBlogin = true;
			// $('.FBloginNote').text('Hello, ' + response.name);
		});
	}

	function failAPI() {
		console.log("Facebook login fail.");
		// $('.inputMessage')
		//	.attr('placeholder', "Please login to chat");
		$rootScope.FBlogin = false;
		// $('.FBloginNote').text("Please login to chat");
	}
}]);

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