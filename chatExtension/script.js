function handleMessage(
	request, 
	sender, sendResponse
	) {
	if (request.type == "url")
		toggleSidebar(request.url);
}

chrome.extension.onMessage.addListener(handleMessage);

var sidebarOpen = false;
function toggleSidebar(url) {
	if(sidebarOpen) {
		var el = document.getElementById('mySidebar');
		el.parentNode.removeChild(el);
		sidebarOpen = false;
	}
	else {
		var sidebar = document.createElement('div');
		sidebar.id = "mySidebar";
		sidebar.innerHTML = `<iframe width="100%" height="100%" src="http://54.213.44.54:3000?url='`+encodeURIComponent(url)+`'" frameborder="0" allowfullscreen></iframe>`;
		sidebar.style.cssText = "\
			position:fixed;\
			color:rgb(255,255,255);\
			top:0px;\
			right:0px;\
			width:100%;\
			height:100%;\
			background:rgba(0,0,0,0);\
			box-shadow:inset 0 0 0.0em black;\
			z-index:999999;\
		";
		document.body.appendChild(sidebar);
		sidebarOpen = true;
	}
}