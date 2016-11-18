// Angular module, defining routes for the app
angular.module('chatApp', ['ui.bootstrap','ngRoute','chatServices']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/chat/:room', { templateUrl: 'partials/chat.html', controller: ChatMsgCtrl }).
      when('/history/:room', { templateUrl: 'partials/history.html', controller: ChatHistoryCtrl }).
			// If invalid route, just redirect to the main list view
			otherwise({ redirectTo: '/chat/' });
	}]);
