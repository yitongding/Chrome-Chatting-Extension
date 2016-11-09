//var socket = io('//localhost:3000');
var socket = io();
var $window = $(window);
var $inputMessage = $('.inputMessage'); // Input message input box
var $messages = $('.messages'); // Messages area
var $topFives = $('.topFives');
var username = 'tmp';
/* help funcitons*/

function cleanInput(input) {
  return $('<div/>').text(input).text();
}

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

function voteBtnListener() {
  //var voted = this.value;
  if (this.value === "false") {
    this.value = true;
    $(this).attr('disable', true);
    socket.emit('upvote', this.id);
  }
}

// Add chat massage to the screen 
function addChatMessage(data, options) {
  var $usernameDiv = $('<span class="username"/>')
    .text(data.username);
  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);
  var $voteBtn = $('<button class="voteBtn">')
    .attr("id", data._id)
    .text('Like')
    .val(false);
  var $voteCount = $('<span class="voteCount">')
    .attr("id", data._id)
    .text(data.upvotes);
  //$voteBtn.onclick = voteBtnListener;
  if (options === "SYSTEM") {
    $voteCount = null;
    $voteBtn = null;
  }
  if (options === "topFive") {
    $messageBodyDiv.removeClass('messageBody').addClass('topFiveBody');
    var $messageDiv = $('<li class="topFive"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv, $voteCount, $voteBtn);
  } else {
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv, $voteCount, $voteBtn);
  }
  addMessageElement($messageDiv, options);
}

// Add any element to the Message window
function addMessageElement(el, options) {
  var $el = $(el);
  if (options === 'topFive') {
    $topFives.append($el);
  } else {
    $messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }
}

$('.messages').on('click', '.voteBtn', voteBtnListener);

$('.messageSubmit').click(function() {
  sendMessage();
});


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

socket.on('new message', function(data) {
  addChatMessage(data);
});

socket.on('established', function(data) {
  console.log(data);
});

socket.on('last ten history', function(data) {
  data.forEach(function(message) {
    addChatMessage(message);
  });
  var historyNotice = {
    username: 'SYSTEM',
    message: '*******ABOVE IS TEN CHATTING HISTORY*******'
  };
  addChatMessage(historyNotice, "SYSTEM");
});

socket.on('upvote', function(message) {
  $('.voteCount#' + message._id).each(function(){$(this).text(message.upvotes);});
});

socket.on('top five', function(messages) {
    $topFives.empty();
    messages.forEach(function(message) {
    addChatMessage(message, "topFive");
  });
});
