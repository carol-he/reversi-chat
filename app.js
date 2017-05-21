const db = require( './db' );
const express = require('express');
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
//const bcrypt = require('bcrypt');
const io = require('socket.io')(http);
const passport = require('passport')
//const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

// Load the core build.
const _ = require('lodash/core');

const sortBy = require('lodash.sortby');

app.use(bodyParser.urlencoded({ extended: false }));

// passport.use(new FacebookStrategy({
//     clientID: 1815619725423560,
//     clientSecret: "587111d5b4f123a71fcafe0f1cf4ca59",
//     callbackURL: "http://localhost:8080/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({limit: '1mb'}));

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
io.use(sharedsession(session, {
    autoSave:true
}));

//require mongoose
const mongoose = require('mongoose');
//create constructor/model
const Online = mongoose.model('Online');
const Leaderboard = mongoose.model('Leaderboard');

// passport config
let Account = require('./account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//mongoose things
// is the environment variable, NODE_ENV, set to PRODUCTION?
//if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
//} else {
 // if we're not in PRODUCTION mode, then use
// dbconf = 'mongodb://localhost/chatroomproject';
//}

mongoose.connect(dbconf);

//sets ur game stats to 0 instead of undefined
app.use('/gameroom', (req, res, next) => {
  if(req.user){
    Account.findOne({username: req.user.username }, function(err, account, count) {
      console.log("account: ", account);
      if(!account.wins){
        account.wins = 0;
      }
      if(!account.losses){
        account.losses = 0;
      }
      if(!account.ties){
        account.ties = 0;
      }
      if(!account.gamesPlayed){
        account.gamesPlayed = 0;
      }
    	account.save();
    });
  }
  next();
});


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

app.get('/api/gameroom/update', (req, res) => {
  console.log(req.method, req.path, "-", res.statusCode);
});
//
app.post('/api/gameroom/update', (req, res) => {
  // update one after finding (hello callbacks!)
  console.log(req.method, req.path, "-", res.statusCode);
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
        console.log(saveUser);
        console.log(saveUser._id);
        Leaderboard.findOne({}, function(err, leaderboard) {
          let exists = false;
          console.log(leaderboard);
          if(err) {
            console.log(err);
          }
          //if it's not on leaderboard, push it on
          if(leaderboard){
            leaderboard.users.forEach(function(l, i, arr) {
              console.log("l: ", l);
              console.log("savuser: ", saveUser._id);
              console.log(l.toString());
              console.log(saveUser._id.toString());

              if(l.toString() === saveUser._id.toString()){
                exists = true;
                console.log("its already there");
              }
            });
          } else { //if there's no leaderboard make one
            leaderboard = new Leaderboard({
              users: []
            });
          }
          if(!exists){
            console.log("pushing to leaderboard");
            leaderboard.users.push(saveUser._id);
            leaderboard.save(function(saveErr, saveLeaderboard) {
              if(saveErr){
                console.log(saveErr);
              }
              console.log(saveLeaderboard);
            });
          }
          res.send({"wins": saveUser.wins, "losses": saveUser.losses, "ties": saveUser.ties, "gamesPlayed": saveUser.gamesPlayed});
        });

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
  Account.register(new Account({ username : req.body.username}), req.body.password, function(err, account) {
      if (err) {
          return res.render('register', { account : account });
      }
      passport.authenticate('local')(req, res, function () {
          res.redirect('/');
      });
  });
});

app.get('/leaderboard', function (req, res) {
  //find the array
  let arrusers = [];
  Leaderboard.findOne({}, function(err, leaderboard, count) {
    if(err) {
      console.log(err);
    }
    //get actual array of users
    leaderboard.users.forEach(function(u, i, arr){
      console.log("u", u);
      console.log("i", i)
      console.log(arr.length);
      Account.findOne({_id: u}, function(e, a){
        if(e){
          console.log(e);
        }
        console.log("a: ", a);
        arrusers.push(a);
        if(i > arr.length - 2){
          console.log("arrusers, BEFORE", arrusers);
          //sort
          // arrusers.filter(){
          //
          // }
          arrusers = _.sortBy(arrusers, "wins");
          //have to reverse bc ascending order
          arrusers = arrusers.reverse();
          //only show top 10 users
          let count = 0;
          let ten = [];
          function getTen(x){
            if(count < 10){
              ten.push(x);
              count++;
            }
          }
          arrusers.map(getTen);
          arrusers = ten;
          //filter out users who have not played the game
          let np = [];
          function notPlayed(x){
            if(x.gamesPlayed !== 0){
              np.push(x);
            }
          }
          arrusers.filter(notPlayed);
          arrusers = np;
          //filter users who have wins < 1
          let suc = [];
          function succ(x){
            console.log("WIN");
            if(x.wins > 0){
              suc.push(x);
            }
          }
          arrusers.filter(succ);
          arrusers = suc;
          console.log("arrusers, AFTER", arrusers);
          for(let i = 0; i < arrusers.length; i++){
            console.log("???", arrusers[i].wins);
          }
          arrusers = _.sortBy(arrusers, "wins");
          arrusers = arrusers.reverse();
          res.render('leaderboard', {arrusers: arrusers});
        }
      });
    });
  });
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
    Online.find({onlineUser: msg}, (err, onlines) => {
			if(err) {
				console.log(err);
			}
      if(!onlines){
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
      }
			console.log("ONLINES", onlines);
			//res.render('chat', {inSession: req.session.username, onlines: onlines});
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
			});
		});
  });
});

http.listen(process.env.PORT || 8080);
