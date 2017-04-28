# ReversiChat

## Overview

Sometimes you're bored... and you just want start a conversation with a random stranger or play othello with another person who's bored. This app is the solution to your boredom!

ReversiChat is a web app that will allow you to talk to anyone who logs in the server, and also play reversi! Users can register and login. Once they're logged in, they are automatically put in the general chat. Then they have the option of playing reversi in a gameroom against a computer player. There's a leaderboard that keeps track of who has the most wins and win percentage in the game.

## Data Model

The application will store Accounts, Onlines, and Leaderboard

* Leaderboard has multiple users (via references)

An Example Account:

```javascript
{
  username: "player1",
  hash: // a password hash,
  email: "playa@gmail.com",
  wins: 3,
  losses: 2,
  ties: 5,
  gamesPlayed: 10,
  currentGameInfo: {
    currentGameId: // unique number for game,
    color: // X/O
  }
}
```

An Example Leaderboard:

```javascript
{
  users: // a reference to a set of user objects,
}
```


An Example Online:

```javascript
{
  onlineUser: // String
}
```


## [Link to Commented First Draft Schema](db.js)

## Wireframes

/login - page for logging into chat server

![login](documentation/login.png)

/register - page for making an account

![register](documentation/register.png)

/ - main chat page

![main](documentation/mainchat.png)

/ - page for playing reversi

![reversi](documentation/game.png)

/leaderboard - shows leaderboard

![leaderboard](documentation/leaderboard.png)

## Site map

![sitemap](documentation/sitemap.png)

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can chat with other online users
4. as a user, I can view those who are online to see if there's anyone I can play
5. as a user, I can play othello in gameroom
6. as a non-registered or registered user, I can view the leaderboard to see who has had the most wins

## Research Topics
* (5 points) Socket.io
    * enables real-time bidirectional event-based communication
    * want to use this to send chat messages back and forth from client to server to client
    * want to use this to keep a list of people who are online
    * want to use this to update win/lose game data in database
* (2 points) Integrate user authentication
    * I'm going to be using passport for user authentication
* (2 points) Bootstrap Used
* (1 point) LoDash used to simplify sorting objects
10 points total out of 8 required points


## [Link to Initial Main Project File](app.js)

## Annotations / References Used

1. [socket.io](https://socket.io/docs) - https://github.com/socketio/chat-example
2. [passport.js](http://passportjs.org/) - http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.WQEj41MrLfZ
3. [lodash](https://lodash.com/docs/4.17.4)
