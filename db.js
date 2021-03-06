const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Link.plugin(URLSlugs('title'));
const Online = new mongoose.Schema({
  onlineUser: String
  //onlineUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Leaderboard = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }]// a reference to a set of user objects
});

const Game = new mongoose.Schema({
  currentGameId: {type: Number, unique: true},
  boardState: {
    board: String, // array with board info
    turn: String // whose turn it is X/O
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }]// a reference to user objects
});

const y = mongoose.model('Leaderboard', Leaderboard);
const z = mongoose.model('Game', Game);
mongoose.model('Online', Online);
