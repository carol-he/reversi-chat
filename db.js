const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');


const User = new mongoose.Schema({
  username: "player1",
  hash: // a password hash,
  email: 'playa@gmail.com',
  wins: 3,
  gamesPlayed: 10,
  currentGameInfo: {
    currentGameId: // unique number for game
    color: // X/O
  }
});
// Link.plugin(URLSlugs('title'));

const Leaderboard = new mongoose.Schema({
  users: // a reference to a set of user objects
});

const Game = new mongoose.Schema({
  currentGameId: // unique number for game
  boardState: {
    board: // array with board info
    turn: // whose turn it is X/O
  },
  players: // a reference to two user objects
});

Link.plugin(URLSlugs('title'));

const x = mongoose.model('User', User);
const y = mongoose.model('Leaderboard', Leaderboard);
const z = mongoose.model('Game', Game);

mongoose.connect('mongodb://localhost/ReversiChat');
