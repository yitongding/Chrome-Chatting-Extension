function handleMessage(
	request, 
	sender, sendResponse
	) {
	if (request.type == "connect") {
		local_username = request.data.username;
		toggleSidebar(request.data, "connection");
	}
	if (request.type == "showChat")
		toggleSidebar(null, "visibility");
	if (request.type == "setName") {
		local_username = request.data.username;
		toggleSidebar(request.data, "setName");
	}
	if (request.type == "changeMode")
		toggleSidebar(request.data, "changeMode");
	if (request.type == "getStatus")
		sendResponse({sidebarOpen: sidebarOpen, sidebarVisible: sidebarVisible, username: local_username});
}

chrome.extension.onMessage.addListener(handleMessage);

var sidebarOpen = false;
var sidebarVisible = false;
var local_username = "anonymous";

function createSideBar(url, username, option) {
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


function toggleSidebar(data, option) {
	if (option == "connection") {
		var url = data.url;
		var username = data.username;
		if (sidebarOpen) {
			jQuery('#mySidebar').remove();
			sidebarOpen = false;
			sidebarVisible = false;
		} else {
			createSideBar(url, username, null);
		}
	}
	if (option == "visibility") {
		if (sidebarVisible) {
			jQuery('#mySidebar').hide();
		} else {
			jQuery('#mySidebar').show();
		}
		sidebarVisible = !sidebarVisible;
	}
	if (option == "setName") {
		var url = data.url;
		var username = data.username;
		jQuery('#mySidebar').remove();	// remove the old side bar
		createSideBar(url, username, null);		// add new side bar with new username
	}
	if (option == "changeMode") {
		var url = data.url;
		var username = data.username;
		jQuery('#mySidebar').remove();
		// !!!!!!!!!!!!!!add bullet comment sibe bar
	}

}