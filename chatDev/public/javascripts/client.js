//var socket = io('//localhost:3000');
var socket = io();
var $window = $(window);
var $inputMessage = $('.inputMessage'); // Input message input box
var $messages = $('.messages'); // Messages area
var $topFive = $('.topFive');
var blockList = [];

/* help funcitons*/

// Sends a chat message
function sendMessage() {
  var text = $inputMessage.val();
  // Prevent markup from being injected into the message
  if (text) {
    // if there is a non-empty message
    $inputMessage.val('');

    if ($('.anonymousCheckbox').checked)
      var anonymous = true;
    else 
      var anonymous = false;

    var message = {
      text: text,
      anonymous: anonymous
    }
    
    socket.emit('new message', message);
  }
}


function voteBtnListener() {
  //var voted = this.value;
  if ($(this).attr('clicked') == "false") {
    $(this).attr('clicked', "true");
    $(this).attr('disabled', true);
    socket.emit('upvote', this.id);
  }
}


function alertBuilder(text, id, options) {
  var $alertClose = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
  var $alertDiv = $('<div class="alert" role="alert">')
  var $alertText = $('<span>').text(text);
  var $alertUndo = $('<a href="#" class="alertUndo alert-link">')
    .text('Undo')
    .attr('id', id);
  if (options == "success") {
    $alertDiv.addClass('alert-success');
  }
  if (options == "warning") {
    $alertDiv.addClass('alert-warning');
  }
  if (options == "undo") {
    $alertDiv.addClass('alert-success');
    $alertUndo = null;
  }
  $alertDiv.append($alertClose, $alertText, $alertUndo);
  $('.alertContainner').empty().append($alertDiv);
}


function blockBtnListener() {
  if ($(this).attr('clicked') == "true") return;

  $('#'+$(this).attr('id')+'.blockBtn')
    .attr('clicked', "true")
    .attr('disabled', true);
  blockList.push($(this).attr('id'));

  if ($(this).attr('id') != 0)
    alertBuilder("That user has been added to your block list.", $(this).attr('id'), "success");
  else 
    alertBuilder("NOTE: all anonyous message has been blocked", $(this).attr('id'), "warning");
}


function blockUndoListener() {
  blockList.pop();
  $('#'+$(this).attr('id')+".blockBtn").removeAttr('disabled');
  alertBuilder("Undo success.", null, "undo");
}


// Add chat massage to the screen 
function addChatMessage(data, options) {
  var $usernameDiv = $('<span class="username"/>')
    .text(data.username);

  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);

  var $thumbs = $('<span class="glyphicon glyphicon-thumbs-up">');
  var $voteBtn = $('<div class="voteBtn btn btn-default">')
    .attr("id", data._id)
    .attr("clicked", "false")
    .append($thumbs);

  var $voteCount = $('<span class="voteCount">')
    .attr("id", data._id)
    .text(data.upvotes);

  var $blockImg = $('<span class="glyphicon glyphicon-eye-close">');
  var $blockBtn = $('<div class="blockBtn btn btn-default">')
    .attr("id", data.FBid)
    .attr("clicked", "false")
    .append($blockImg);

  if (options === "SYSTEM") {
    $voteCount = null;
    $voteBtn = null;
    $blockBtn = null;
  }

  if (options === "topFive") {
    $messageBodyDiv.removeClass('messageBody').addClass('topFiveMessage');
    var $messageDiv = $('<li class="topFiveDiv"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv, $voteBtn, $voteCount);
  } else {
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv, $voteBtn, $voteCount, $blockBtn);
  }

  addMessageElement($messageDiv, options);
}

// Add any element to the Message window
function addMessageElement(el, options) {
  var $el = $(el);
  if (options === 'topFive') {
    $topFive.append($el);
  } else {
    $messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }
}

$window.keydown(function(event) {
  // When the client hits ENTER on their keyboard 
  if (event.which === 13) {
    sendMessage();
  }
});


$('.chatArea').on('click', '.voteBtn', voteBtnListener);

$('.chatArea').on('click', '.blockBtn', blockBtnListener);

$('.chatArea').on('click', '.alertUndo', blockUndoListener);

// $('.messageSubmit').click(function() {
//   sendMessage();
// });

socket.on('established', function(data) {
  console.log(data);
});


socket.on('new message', function(data) {
  if (blockList.indexOf(data.FBid) == -1) {
    addChatMessage(data);
  }
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
  $('span#'+message._id+'.voteCount').text(message.upvotes);
});


socket.on('top five', function(messages) {
    $topFive.empty();
    messages.forEach(function(message) {
    addChatMessage(message, "topFive");
  });
});
