// Angular service module for connecting to JSON APIs
angular.module('chatServices', ['ngResource']).
factory('lastTenMsg', function($resource) {
	return $resource('chat/lastTen/:room', {}, {
		'get': {
			method: 'GET',
			isArray: true
		}
	})
}).
factory('topFiveMsg', function($resource) {
	return $resource('chat/topFive/:room', {}, {
		'get': {
			method: 'GET',
			isArray: true
		}
	})
}).
factory('historyMsg', function($resource) {
	return $resource('history/:room', {}, {
		'get': {
			method: 'GET',
			isArray: true
		}
	})
}).
factory('Poll', function($resource) {
	return $resource('polls/:room', {}, {
		// Use this method for getting a list of polls
		'get': {
			method: 'GET',
			isArray: true
		}
	})
}).
factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});