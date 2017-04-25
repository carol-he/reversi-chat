const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
  username: {type: String, unique: true},
  password: String,
  email: String,
  wins: Number,
  gamesPlayed: Number,
  currentGameInfo: {
    currentGameId: Number,
    color: String
  }
});
// Link.plugin(URLSlugs('title'));
const Online = new mongoose.Schema({
  onlineUser: String
  //onlineUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Leaderboard = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]// a reference to a set of user objects
});

const Game = new mongoose.Schema({
  currentGameId: {type: Number, unique: true},
  boardState: {
    board: String, // array with board info
    turn: String // whose turn it is X/O
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]// a reference to user objects
});

const x = mongoose.model('User', User);
const y = mongoose.model('Leaderboard', Leaderboard);
const z = mongoose.model('Game', Game);
mongoose.model('Online', Online);
