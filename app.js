const db = require( './db' );
const express = require('express');
const session = require('express-session');
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const bcrypt = require('bcrypt');
const io = require('socket.io')(http);
const sharedsession = require("express-socket.io-session");
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

app.use(bodyParser.urlencoded({ extended: false }));

passport.use(new FacebookStrategy({
    clientID: 1815619725423560,
    clientSecret: "587111d5b4f123a71fcafe0f1cf4ca59",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// io.use(sharedsession(session, {
//     autoSave:true
// }));

//require mongoose
const mongoose = require('mongoose');
//create constructor/model
const User = mongoose.model('User');
const Online = mongoose.model('Online');

// passport config
var Account = require('./account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//mongoose things
// is the environment variable, NODE_ENV, set to PRODUCTION?
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/chatroomproject';
}

mongoose.connect(dbconf);


app.get('/', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  if(!req.session.username){
    res.redirect('/login');
    console.log(req.method, req.path, "-", res.statusCode);
  }
  else{
		Online.find({}, (err, onlines) => {
			if(err) {
				console.log(err);
			}
			res.render('chat', {inSession: req.session.username, onlines: onlines});
		});
  }
});

app.get('/gameroom', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  res.render('gameroom');
});

app.get('/gamerooms', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  res.render('gamerooms');
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
						console.log(req.session);
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

app.get('/leaderboard', function (req, res) {
  res.render('leaderboard');
});

app.get('/logout', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  req.session.destroy(function(err) {
		if(err){
			console.log(err);
		}
    res.redirect('/');
		console.log(req.method, req.path, "-", res.statusCode);
  });
});

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

//broadcast to everyone
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
	socket.on('connect', function(msg){
		io.emit('person is online', msg);
		console.log("req.session.usr: ", req.session.username);
		const o = new Online({
			onlineUser: req.session.username
		});
		console.log(' has connected');
		console.log("o", o);
		o.save((err) => {
			if(err) {
					console.log(err);
			}
		});
		Online.find({}, (err, onlines) => {
			if(err) {
				console.log(err);
			}
			console.log("ONLINES", onlines);
			//res.render('chat', {inSession: req.session.username, onlines: onlines});
		});
	});
	socket.on('disconnect', function(msg){
		io.emit('person is offline', msg);
		console.log(' has disconnected');
		Online.find({}, (err, onlines) => {
			if(err) {
				console.log(err);
			}
			// Online.remove({onlineUser: req.session.username}, (err) => {
			// 	if(err) {
			// 		console.log(err);
			// 	}
			// 	console.log("hi");
			// });
			//res.render('chat', {inSession: req.session.username, onlines: onlines});
		});
	});
});

http.listen(process.env.PORT || 8080);
