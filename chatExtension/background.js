console.log('Background.html starting!');
chrome.tabs.onUpdated.addListener(function(tabId) {
	chrome.pageAction.show(tabId);
});

chrome.tabs.getSelected(null, function(tab) {
	chrome.pageAction.show(tab.id);
});

chrome.pageAction.onClicked.addListener(function(tab) {
	// chrome.tabs.getSelected(null, function(tab) {
	// 	chrome.tabs.sendRequest(
	// 		tab.id,
	// 		{callFunction: "toggleSidebar"}, 
	// 		function(response) {
	// 			console.log(response);
	// 		}
	// 	);
	// });
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			type: "url",
			url: tabs[0].url
		}, null);
	});
});
console.log('Background.html done.');