var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const Account = new mongoose.Schema({
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

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
