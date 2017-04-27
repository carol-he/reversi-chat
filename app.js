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
    callbackURL: "http://localhost:8080/auth/facebook/callback"
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
const Online = mongoose.model('Online');

// passport config
let Account = require('./account');
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
	console.log(req.method, req.path, "-", res.statusCode);;

  if(!req.user){
    res.redirect('/login');
    console.log(req.method, req.path, "-", res.statusCode);
  }
  else{
    console.log(req.user);
    res.redirect('/chat');
    console.log(req.method, req.path, "-", res.statusCode);
  }
});

app.get('/chat', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  if(!req.user){
    res.redirect('/login');
    console.log(req.method, req.path, "-", res.statusCode);
  }
  else {
    Online.find({}, (err, onlines) => {
      if(err) {
        console.log(err);
      }
      res.render('chat', {inSession: req.user.username, onlines: onlines});
    });
  }
});

app.get('/gameroom', (req, res) => {
	console.log(req.method, req.path, "-", res.statusCode);
  if(!req.user){
    res.redirect('/login');
    console.log(req.method, req.path, "-", res.statusCode);
  }
  else {
    res.render('gameroom', {inSession: req.user.username});
  }
});

app.get('/api/gameroom', (req, res) => {
  // update one after finding (hello callbacks!)
  Account.findOne({username: inSession }, function(err, account, count) {
      // we can call push on toppings!
      console.log("account: ", account);
      if(score === "win"){
        account.wins++;
      }
      else if(score === "loss"){
        account.losses++;
      }
      else if(score === "tie"){
        account.ties++;
      }
  	account.save(function(saveErr, saveUser, saveCount) {
  		console.log(saveUser);
  	});
  });
});

//
app.post('/api/gameroom/update', (req, res) => {
  // update one after finding (hello callbacks!)
  Account.findOne({username: req.query.username }, function(err, account, count) {
    console.log("account: ", account);
      if(req.query.score === "win"){
        if(!account.wins){
          account.wins = 0;
        }
        account.wins++;
      }
      else if(req.query.score === "loss"){
        if(!account.losses){
          account.losses = 0;
        }
        account.losses++;
      }
      else if(req.query.score === "tie"){
        if(!account.ties){
          account.ties = 0;
        }
        account.ties++;
      }
      if(!account.gamesPlayed){
        account.gamesPlayed = 0;
      }
      account.gamesPlayed++;
  	account.save(function(saveErr, saveUser) {
      console.log("saveErr", saveErr);
  		console.log("saveUser", saveUser);
      if(saveUser){
        res.send({"wins": saveUser.wins, "losses": saveUser.losses, "ties": saveUser.ties, "gamesPlayed": saveUser.gamesPlayed});
      } else {
        res.send({'err': 'update score failed'})
      }
  	});
  });
});

app.get('/login', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  res.render('login');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  res.redirect('/');
});

app.get('/register', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
      if (err) {
          return res.render('register', { account : account });
      }
      passport.authenticate('local')(req, res, function () {
          res.redirect('/');
      });
  });
});

app.get('/leaderboard', function (req, res) {
  res.render('leaderboard');
});

app.get('/logout', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
  req.logout();
  res.redirect('/');
});

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });




//broadcast to everyone
io.on('connection', function(socket){
  let userID;
  //for sending chat messages
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  //to tell when someone connected
	socket.on('person is online', function(msg){
    userID = msg;
		io.emit('person is online', msg);
		console.log("req.session.usr: ", msg);
		const o = new Online({
			onlineUser: msg
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
  //to tell when someone disconnected
  socket.on('disconnect', function(msg){
    io.emit('person is offline', userID);
		console.log(' has disconnected', userID);
		Online.find({}, (err, onlines) => {
			if(err) {
				console.log(err);
			}
			Online.remove({onlineUser: userID}, (err) => {
				if(err) {
					console.log(err);
				}
				console.log("hi");
			});
		});
  });
});

http.listen(process.env.PORT || 8080);
