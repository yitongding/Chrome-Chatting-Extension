// Angular module, defining routes for the app
angular.module('chatApp', ['chart.js', 'ui.bootstrap', 'ngRoute', 'chatServices', 'ezfb'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/chat/:room', {
      templateUrl: 'partials/chat.html',
      controller: ChatMsgCtrl
    }).
    when('/history/:room', {
      templateUrl: 'partials/history.html',
      controller: ChatHistoryCtrl
    }).
    when('/polls/:room/new', {
      templateUrl: 'partials/newpoll.html',
      controller: NewPollCtrl
    }).
    when('/polls/:room/:pollId', {
      templateUrl: 'partials/poll.html',
      controller: PollCtrl
    }).
    when('/polls/:room', {
      templateUrl: 'partials/pollList.html',
      controller: PollListCtrl
    }).
    when('/chat/:room/topfive', {
      templateUrl: 'partials/topfive.html',
      controller: TopfiveCtrl
    }).
    // If invalid route, just redirect to the main list view
    otherwise({
      redirectTo: '/chat/' + encodeURIComponent("54.213.44.54:3000")
    });
  }])
  .config(function(ezfbProvider) {
    ezfbProvider.setInitParams({
      appId: '1338404279506042'
    });
  });