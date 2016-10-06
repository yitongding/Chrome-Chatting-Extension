'use strict';

$(function() {
	var chatVisible = false;

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		// error handling
		var showError = function(err) {
			console.log("Error: " + err);
		};

		// send a message to the content script
		/*var sendMessage = function(type, data, callback) {
			chrome.tabs.executeScript(tabs[0].id, {
				file: 'content_script.js'
			}, function() {
				chrome.tabs.sendMessage(tabs[0].id, {
					type: type,
					data: data
				}, function(response) {
					if (callback) {
						callback(response);
					}
				});
			});
		};*/
		var sendMessage = function(type, data, callback) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: type,
				data: data
			}, function(response) {
				if (callback) {
					callback(response);
				}
			});
		};


		sendMessage('getStatus', {}, function(status) {
			var url = tabs[0].url;
			/*
			if (status.errorMessage) {
				showError(status.errorMessage);
				return;
			}
			*/

			$('.join_chat_btn').click(function() {
				chatVisible = !chatVisible;
				sendMessage('initChat', {
					url: url
				}, null);
			});

			$('.show_chat_btn').click(function() {
				chatVisible = !chatVisible;
				sendMessage('showChat', {
					visible: chatVisible
				}), null;
			});
		});


	});
});