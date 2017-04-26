$(function () {
  const socket = io();
  $('form').submit(function(){
    const $cont = $('#message-inner-box');
    $cont[0].scrollTop = $cont[0].scrollHeight;
    socket.emit('chat message', '<b>' + inSession + '</b>' + ": " + $('#m').val());
    $('#m').val('');
    $('#m').keyup(function(e) {
        if (e.keyCode === 13) {
            //$cont.append('<li>' + $(this).val() + '</li>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            //$('#m').val('');
        }
    })
    .focus();
    return false;
  });
  // emitting actually??
  socket.on('chat message', function(msg){
    $('#messages').append($('<li id="' + inSession + '">').html(msg));
  });
  socket.on('connect', function () {
    console.log('hi');
    socket.emit('person is online', inSession);
    console.log("online id", inSession);
  });
  //if someone logs in, append their username
  socket.on('person is online', function (msg) {
    console.log("caught");
    $('#people').append($('<li id="' + inSession + '">').html("<p>" + msg + "</p>"));
    console.log("online id", inSession);
  });
  socket.on('disconnect', function () {
    console.log("disconnected");
    socket.emit('person is offline', inSession);
    console.log("offline id", inSession);
  });
  socket.on('person is offline', function(msg){
    console.log("going offline id", inSession);
    $('#' + inSession).remove();
    console.log("test");
  });
  //if someone logs out, find their username and remove it
});
