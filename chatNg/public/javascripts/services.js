// Angular service module for connecting to JSON APIs
angular.module('chatServices', ['ngResource']).
	factory('Message', function($resource) {
		return $resource('messages/:room', {}, {
			// Use this method for getting a list of polls
			top: { method: 'GET', params: { top: true }, isArray: true },
			his: { method: 'GET', params: { his: true }, isArray: true }
		})
	}).
	factory('Poll', function($resource) {
		return $resource('polls/:pollId', {}, {
			// Use this method for getting a list of polls
			query: { method: 'GET', params: { pollId: 'polls' }, isArray: true }
		})
	}).
	factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
		};
	});