//var socket = io('//localhost:3000');
var socket = io();
<<<<<<< HEAD
var $window = $(window);
var $inputMessage = $('.inputMessage'); // Input message input box
var $messages = $('.messages'); // Messages area
var username = 'tmp';
=======

//#### var $usernameInput = $('.usernameInput'); // Input for username
var $inputMessage = $('.inputMessage'); // Input message input box
var $messages = $('.messages'); // Messages area
var $window = $(window);

//#### need change
var username = "tmp";
>>>>>>> dd221fa89de433aba845b0d1671ef5b74d3ab2ab
/* help funcitons*/

function cleanInput(input) {
  return $('<div/>').text(input).text();
}

/* ####
function setUsername() {
  username = cleanInput($usernameInput.val().trim());
  if (username) {
    $loginPage.fadeOut();
    $chatPage.show();
    $inputMessage.focus();
    socket.emit('new user', username);
  }
}
*/

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
  var $usernameDiv = $('<span class="username"/>')
    .text(data.username);
  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);
  var $messageDiv = $('<li class="message"/>')
    .data('username', data.username)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

// Add any element to the Message window
function addMessageElement(el, options) {
  var $el = $(el);
  $messages.append($el);
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

$('.messageSubmit').click(function() {
  sendMessage();
});

<<<<<<< HEAD
$window.keydown(function(event) { 
// When the client hits ENTER on their keyboard 
if (event.which === 13) { if (username) { sendMessage(); } else { 
//#### setUsername(); 
} } });

socket.on('new message', function (data) {
=======
$window.keydown(function(event) {
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
    } else {
      //#### setUsername();
    }
  }
});

//socket.on('url req')

socket.on('new message', function(data) {
>>>>>>> dd221fa89de433aba845b0d1671ef5b74d3ab2ab
  addChatMessage(data);
});

socket.on('socketToMe', function(data) {
  console.log(data);
});
<<<<<<< HEAD
=======

socket.on('url req', function(data) {
  console.log("url req received from server.");
  var url = window.location.href;
  socket.emit('url res', url);
});
>>>>>>> dd221fa89de433aba845b0d1671ef5b74d3ab2ab
