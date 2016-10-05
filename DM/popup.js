chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = 'popup.html';
  chrome.tabs.create({ url: newURL });
});


chrome.tabs.getSelected(null, function(tab) {
    document.getElementById('currentLink').innerHTML = tab.url;
});