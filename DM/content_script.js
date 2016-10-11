(function() {
	// make sure the content script is only run once on the page
	if (true) {
		window.chatLoaded = true;

		//////////////////////////////////////////////////////////////////////////
		// Chat API                                                             //
		//////////////////////////////////////////////////////////////////////////
		var $inputMessage = jQuery('.inputMessage'); // Input message input box
		var $messages = jQuery('.messages'); // Messages area
		var $window = jQuery(window);
		var chatVisible = false;
		var url;
		var username = "tmp";

		var chatHtml = `
		<style>
		 .chat-container {
          width: 100px;
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          cursor: auto;
          user-select: text;
          -webkit-user-select: text;
          z-index: 9999999999;
          padding: $20px;
        }
    </style>
		<div class="chat-container">
			<div class="chatArea">
      	<h2>Chating</h2>
      	<ul class="messages"></ul>
    	</div>
	    <div class="inputArea form-inline">
	      <input class="inputMessage" placeholder="Type here..."/>
	      <button class="messageSubmit btn btn-default">Send</button>
	    </div>
	   </div>
		`;

		var setChatVisible = function(visible) {
			if (visible) {
				jQuery('.chatArea').show();
			} else {
				jQuery('.chatArea').hide();
			}
		};

		var initChat = function() {
			if (jQuery('.chatArea').length === 0) {
				jQuery('body').prepend(chatHtml);

				jQuery('.messageSubmit').on("click", function() {
					sendMessage();
				});

			}
		};


		//////////////////////////////////////////////////////////////////////////
		// Socket                                                               //
		//////////////////////////////////////////////////////////////////////////
		var socket = io('54.213.44.54:8000');

		// Sends a chat message
		function sendMessage() {
			var message = $inputMessage.val();
			// Prevent markup from being injected into the message
			if (message) {
				// if there is a non-empty message
				$inputMessage.val('');
				// tell server to execute 'new message' and send along one parameter
				socket.emit('new message', message);
			}
		}

		// Add chat massage to the screen 
		function addChatMessage(data, options) {
			var $usernameDiv = jQuery('<span class="username"/>')
				.text(data.username);
			var $messageBodyDiv = jQuery('<span class="messageBody">')
				.text(data.message);
			var $messageDiv = jQuery('<li class="message"/>')
				.data('username', data.username)
				.append($usernameDiv, $messageBodyDiv);

			addMessageElement($messageDiv, options);
		}

		// Add any element to the Message window
		function addMessageElement(el, options) {
			var $el = jQuery(el);
			$messages.append($el);
			$messages[0].scrollTop = $messages[0].scrollHeight;
		}

		$window.keydown(function(event) {
			// When the client hits ENTER on their keyboard
			if (event.which === 13 && chatVisible) {
				if (username) {
					sendMessage();
				} else {
					//#### setUsername();
				}
			}
		});



		//socket.on('url req')

		socket.on('new message', function(data) {
			addChatMessage(data);
		});

		socket.on('socketToMe', function(data) {
			console.log(data);
		});

		socket.on('url req', function(data) {
			console.log("url req received from server.");
			var url = window.location.href;
			socket.emit('url res', url);
		});


		//////////////////////////////////////////////////////////////////////////
		// popup interaction                                                    //
		//////////////////////////////////////////////////////////////////////////

		chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {
				if (request.type === 'getStatus') {
					return;
				}

				if (request.type === 'initChat') {
					initChat();
					url = request.data.url;
					socket.emit('url res', url);
					setChatVisible(true);
					return;
				}

				if (request.type === 'showChat') {
					setChatVisible(request.data.visible);
					return;
				}

			});

	}
})();