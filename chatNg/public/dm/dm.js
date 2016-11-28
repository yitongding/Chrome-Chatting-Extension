(function () {
  $("#danmu").danmu({
    left: $("#danmuarea").offset().left,
    top: $("#danmuarea").offset().top,
    height: 445,
    width: 800,
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    speed: 30000,
    opacity: 1,
    font_size_small: 20,
    font_size_big: 40,
    top_botton_danmu_time: 6000
  });
})(jQuery);


query();
timedCount();

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

var first = true;

function timedCount() {
  $("#time").text($('#danmu').data("nowtime"));

  t = setTimeout("timedCount()", 50)

}



function starter() {

  $('#danmu').danmu('danmu_start');

}

function pauser() {

  $('#danmu').danmu('danmu_pause');
}

function resumer() {

  $('#danmu').danmu('danmu_resume');
}

function stoper() {
  $('#danmu').danmu('danmu_stop');
}

function getime() {
  alert($('#danmu').data("nowtime"));
}

function getpaused() {
  alert($('#danmu').data("paused"));
}

function add() {
  var newd = {
    "text": "new2",
    "color": "green",
    "size": "1",
    "position": "0",
    "time": 60
  };

  $('#danmu').danmu("add_danmu", newd);
}

function insert() {
  var newd = {
    "text": "new2",
    "color": "green",
    "size": "1",
    "position": "0",
    "time": 50
  };
  str_newd = JSON.stringify(newd);
  $.post("stone.php", {
    danmu: str_newd
  }, function (data, status) {
    alert(data)
  });
}

function query() {
  $.get("query.php", function (data, status) {
    var danmu_from_sql = eval(data);
    for (var i = 0; i < danmu_from_sql.length; i++) {
      var danmu_ls = eval('(' + danmu_from_sql[i] + ')');
      $('#danmu').danmu("add_danmu", danmu_ls);
    }
  });
}

/**************************/
/* socket.io **************/

var socket = io();

/*
function send() {
  var text = document.getElementById('text').value;
  var color = document.getElementById('color').value;
  var position = document.getElementById('position').value;
  var time = $('#danmu').data("nowtime") + 5;
  var size = document.getElementById('text_size').value;
  var message = text;
  socket.emit('new message', message);
};
*/
//  var text_obj='{ "text":"'+text+'","color":"'+color+'","size":"'+size+'","position":"'+position+'","time":'+time+'}';
//  $.post("stone.php",{danmu:text_obj});
socket.on('new message', function (message) {
  var text = message.message;
  var color = "#2a7ef0";
  var position = 0;
  var time = $('#danmu').data("nowtime") + 5;
  var size = 1;
  var text_obj = '{ "text":"' + text + '","color":"' + color + '","size":"' + size + '","position":"' + position + '","time":' + time + ',"isnew":""}';
  var new_obj = eval('(' + text_obj + ')');

  $('#danmu').danmu("add_danmu", new_obj);
  //document.getElementById('text').value = '';
});

socket.on('established', function (data) {
  console.log(data);
  var room = getUrlParameter('room');
  socket.emit('room url', room);
});

function op() {
  var op = document.getElementById('op').value;
  $('#danmu').data("opacity", op);
}


function changehide() {
  var op = document.getElementById('op').value;
  op = op / 100;
  if (document.getElementById("ishide").checked) {
    jQuery('#danmu').data("opacity", op);
    jQuery(".flying").css({
      "opacity": op
    });
  } else {
    jQuery('#danmu').data("opacity", 0);
    jQuery(".flying").css({
      "opacity": 0
    });
  }
}


function settime() {
  var t = document.getElementById("set_time").value;
  t = parseInt(t)
  console.log(t)
  $('#danmu').data("nowtime", t);
}