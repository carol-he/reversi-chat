var inGame = io.connect('/gameroom');
inGame.on('connect', function () {
  console.log("hello");
});
