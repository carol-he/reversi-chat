const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');


const User = new mongoose.Schema({
  username: {type: String, unique: true},
  hash: String,
  email: String,
  wins: Number,
  gamesPlayed: Number,
  currentGameInfo: {
    currentGameId: Number,
    color: String
  }
});
// Link.plugin(URLSlugs('title'));

const Leaderboard = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]// a reference to a set of user objects
});

const Game = new mongoose.Schema({
  currentGameId: {type: Number, unique: true},
  boardState: {
    board: String, // array with board info
    turn: String // whose turn it is X/O
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]// a reference to two user objects
});

const x = mongoose.model('User', User);
const y = mongoose.model('Leaderboard', Leaderboard);
const z = mongoose.model('Game', Game);

// is the environment variable, NODE_ENV, set to PRODUCTION?
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/YOUR_DATABASE_NAME_HERE';
}

mongoose.connect(dbconf);
