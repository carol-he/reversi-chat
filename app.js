const db = require( './db' );
const express = require('express');
const session = require('express-session');
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const bcrypt = require('bcryptjs');
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));

// express static setup
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const sessionOptions = {
	secret: 'secret cookie thang',
	resave: true,
	saveUninitialized: true
};
app.use(session(sessionOptions));

//require mongoose
const mongoose = require('mongoose');
//create constructor/model
const User = mongoose.model('User');

app.get('/', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  res.render('main', {inSession: req.session.username});
});

app.get('/register', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  if(req.body.password.length < 8){
    User.findOne({username: req.body.username}, (err, result) => {
      if(result){
        res.render('error', {message: 'user already exists & password must be at least 8 characters long'});
      }
      else{
        res.render('error', {message: 'password must be at least 8 characters long'});
      }
    });
  } else {
    User.findOne({username: req.body.username}, (err, result) => {
      if(result){
        res.render('error', {message: 'user already exists'});
      }
      else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
            const u = new User({
              username: req.body.username,
              password: hash
            });
            u.save((err1) => {
              if(err1) {
                  console.log(err1);
              }
            });
            // assuming that user is the user object just saved to the database
            req.session.regenerate((err2) => {
              if (!err2) {
                req.session.username = u.username;
                res.redirect('/');
                console.log(req.method, req.path, "-", res.statusCode);
              } else {
              console.log('error');
              res.send('an error occurred, please see the server logs for more information');
              }
            });
          });
        });
      }
    });
  }
});

app.get('/login', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  res.render('login');
});

app.post('/login', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  User.findOne({username: req.body.username}, (err, user) => {
  if (!err && user) {
    // compare with form password!
    bcrypt.compare(req.body.password, user.password, function(err, auth) {
      if(auth){
        // assuming that user is the user retrieved from the database
        req.session.regenerate((err1) => {
          if (!err1) {
            req.session.username = user.username;
            res.redirect('/');
            console.log(req.method, req.path, "-", res.statusCode);
          } else {
            console.log('error');
            res.send('an error occurred, please see the server logs for more information');
          }
        });
      } else {
        res.render('error', {message: 'incorrect password'});
      }
    });
  } else {
    res.render('error', {message: 'user does not exist'});
  }
  });
});


app.get('/leaderboard', function (req, res) {
  res.render('login');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.listen(process.env.PORT || 3000);
