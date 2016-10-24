function handleMessage(
	request, 
	sender, sendResponse
	) {
	if (request.type == "url")
		toggleSidebar(request.data);
	if (request.type == "showChat")
		toggleSidebar(request.data);
}

chrome.extension.onMessage.addListener(handleMessage);

var sidebarOpen = false;
var sidebarVisible = false;
function toggleSidebar(data) {
	var url = data.url;
	var username = data.username;
	if(sidebarOpen) {
		// var el = document.getElementById('mySidebar');
		// el.parentNode.removeChild(el);
		// sidebarOpen = false;
		if (sidebarVisible) {
			jQuery('#mySidebar').hide();
		} else {
			jQuery('#mySidebar').show();
		}
		sidebarVisible = !sidebarVisible;
	}
	else {
		var sidebar = document.createElement('div');
		sidebar.id = "mySidebar";
		sidebar.innerHTML = `<iframe width="100%" height="100%" src="http://54.213.44.54:3000?url='`+encodeURIComponent(url)+`'&username='`+encodeURIComponent(username)+`'" frameborder="0" allowfullscreen></iframe>`;
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
		sidebarVisible = true;
	}
}