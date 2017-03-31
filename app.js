const db = require( './db' );
const app = require('express')();
const path = require('path');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/register', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/leaderboard', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

app.listen(8080);
