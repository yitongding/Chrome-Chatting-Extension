//var socket = io('//localhost:3000');
var socket = io();
var $window = $(window);
var $inputMessage = $('.inputMessage'); // Input message input box
var $messages = $('.messages'); // Messages area
var username = 'tmp';
/* help funcitons*/



function cleanInput (input) {
  return $('<div/>').text(input).text();
}

// Sends a chat message
function sendMessage () {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  if (message) {
    // if there is a non-empty message
    $inputMessage.val('');
    // tell server to execute 'new message' and send along one parameter
    socket.emit('new message',message);
  }
}

// Add chat massage to the screen 
function addChatMessage (data, options) {
  var $usernameDiv = $('<span class="username"/>')
    .text(data.username);
  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);
  var $messageDiv = $('<li "class="message"/>')
    .data('username', data.username)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

// Add any element to the Message window
function addMessageElement (el, options) {
  var $el = $(el);
  $messages.append($el);
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

$('.messageSubmit').click(function(){
  sendMessage();
});

$('.download').click(function(){
  sendMessage();  
});


$window.keydown(function(event) { 
// When the client hits ENTER on their keyboard 
if (event.which === 13) { if (username) { sendMessage(); } else { 
//#### setUsername(); 
} } });

socket.on('new message', function (data) {
  addChatMessage(data);
});

socket.on('socketToMe', function (data) {
  console.log(data);
});


