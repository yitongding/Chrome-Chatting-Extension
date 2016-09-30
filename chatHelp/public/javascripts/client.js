var socket = io('//localhost:3000');
socket.on('socketToMe', function (data) {
  console.log(data);
});