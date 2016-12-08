String.prototype.hashCode = function () {
	var hash = 0,
		i, chr, len;
	if (this.length === 0) return hash;
	for (i = 0, len = this.length; i < len; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

function handleMessage(
	request,
	sender, sendResponse
) {
	if (request.type == "connect") {
		toggleSidebar(request.data, "connection");
	}

	if (request.type == "showChat")
		toggleSidebar(null, "visibility");

	if (request.type == "setName") {
		toggleSidebar(request.data, "setName");
	}
	if (request.type == "bulletMode")
		toggleSidebar(request.data, "bulletMode");

	if (request.type == "getStatus")
		sendResponse({
			sidebarOpen: sidebarOpen,
			sidebarVisible: sidebarVisible,
			bulletbarVisible: bulletbarVisible
		});
}

chrome.extension.onMessage.addListener(handleMessage);

var sidebarOpen = false;
var sidebarVisible = false;
var bulletbarOpen = false;
var bulletbarVisible = false;
var local_username = "anonymous";
//move hasUrl out

var hashUrl;
function createSideBar(url, option) {
	var sidebar = document.createElement('div');
	hashUrl = url.split("?")[0].split("#")[0].hashCode();
	sidebar.id = "mySidebar";
	sidebar.innerHTML = `<iframe width="100%" height="100%" src="http://54.213.44.54:3000/#/chat/` + hashUrl + `" frameborder="0" allowfullscreen></iframe>`;
	sidebar.style.cssText = "\
		position:fixed;\
		color:rgb(255,255,255);\
		top:0px;\
		right:0px;\
		width:30%;\
		height:100%;\
		background:rgba(0,0,0,0);\
		box-shadow:inset 0 0 0.0em black;\
		z-index:2147483648;\
	";
	document.body.appendChild(sidebar);
	sidebarOpen = true;
	sidebarVisible = true;
}

function createBulletBar(url, option) {
	var bulletbar = document.createElement('div');
	bulletbar.id = "myBulletbar";
	bulletbar.innerHTML = `<iframe width="100%" height="100%" src="http://54.213.44.54:3000/dm/dm.html?room=` + hashUrl + `" frameborder="0" allowfullscreen></iframe>`;
	bulletbar.style.cssText = "\
		position:fixed;\
		color:rgb(255,255,255);\
		top:0px;\
		right:0px;\
		width:100%;\
		height:80%;\
		background:rgba(0,0,0,0);\
		box-shadow:inset 0 0 0.0em black;\
		z-index:2147483648;\
	";
	document.body.appendChild(bulletbar);
	bulletbarOpen = true;
	bulletbarVisible = true;
}


function toggleSidebar(data, option) {
	if (option == "connection") {
		var url = data.url.replace(/https?:\/\//i, "");
		if (sidebarOpen) {
			jQuery('#mySidebar').remove();
			sidebarOpen = false;
			sidebarVisible = false;
		} else {
			createSideBar(url, null);
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
	if (option == "bulletMode") {
		var url = data.url;
		if (bulletbarOpen) {
			if (bulletbarVisible) {
				jQuery('#myBulletbar').hide();

			} else {
				jQuery('#myBulletbar').show();
			}
			bulletbarVisible = !bulletbarVisible;
		} else {
			createBulletBar(url, null);
		}

	}

}