// app.js
let color;
let opponentColor;
let coordMove;
let board;
let userArr;
let opponentArr;
let cellsToFlip;
let isFull;
let userPass = false;
let computerPass = false;
let counts;
let messageBox;
let message = "message";
let width = 0;
let move;
const socket = io();
//generates an HTML element
function generateElement(type, className, id, innerHTML, attrs) {
  const element = document.createElement(type);
  if (className) {
    element.className = className;
  }
  if (id) {
    element.id = id;
  }
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  if (attrs) {
    for (prop in attrs) {
      element.setAttribute(prop, attrs[prop]);
    }
  }
  return element;
}

//generates the board based on width
function ControlledGameSettings(width, color) {
	board = generateBoard(width, width, " ");
	console.log("Player is " + color);
	if(width%2 === 0){
		board = setBoardCell(board, "O", width/2 - 1, width/2 - 1);
		board = setBoardCell(board, "X", width/2 - 1, width/2);
		board = setBoardCell(board, "X", width/2, width/2 - 1);
		board = setBoardCell(board, "O", width/2, width/2);
	}
	else{
		board = setBoardCell(board, "O", (width - 1)/2, (width - 1)/2);
		board = setBoardCell(board, "X", (width - 1)/2 - 1, (width - 1)/2);
		board = setBoardCell(board, "X", (width - 1)/2, (width - 1)/2 - 1);
		board = setBoardCell(board, "O", (width - 1)/2 - 1, (width - 1)/2 - 1);
	}
}

//creates a board element with table and puts it on the DOM (for the first time)
function DisplayBoard(board, width){
  //create the board div (table?)
  const table = generateElement('table', null, 'board', null, null);
  document.body.appendChild(table);
  //generate rows of board and then td in the rows
  for(let i = 0; i < width; i++){
    console.log("test");
    let row = generateElement('tr', 'boardRow', null, null, null);
    document.body.querySelector('table').appendChild(row);
    for(let j = 0; j < width; j++){
      let symbol = board[rowColToIndex(board, i, j)];
      if(symbol === "X"){
        symbol = "⚫";
      }
      else if(symbol === "O"){
        symbol = "⚪";
      }
      let cell = generateElement('td', 'boardCell', null, symbol, null);
      document.body.querySelectorAll('.boardRow')[i].appendChild(cell);
    }
  }
  messagebox = generateElement('div', null, 'gameMessage', message, null);
  document.body.appendChild(messagebox);
}

//updates message game gives player. message is a string
function updateMessage(message) {
  document.body.querySelector('#gameMessage').innerHTML = message;
}

function appendMessage(message) {
  document.body.querySelector('#gameMessage').innerHTML = document.body.querySelector('#gameMessage').innerHTML + '<br>' + message;
}

//updates the actual board data
//maybe should also update database?
function updateBoard(){
  //shouldn't replace table
  let grid = document.body.querySelector('#board');
  console.log(grid);
  //instead of appending elements, change the data of the elements
  //generate rows of board and then td in the rows
  for(let i = 0; i < width; i++){
    for(let j = 0; j < width; j++){
      let symbol = board[rowColToIndex(board, i, j)];
      if(symbol === "X"){
        symbol = "⚫";
      }
      else if(symbol === "O"){
        symbol = "⚪";
      }
      document.body.querySelectorAll('.boardRow')[i].querySelectorAll('.boardCell')[j].innerHTML = symbol;
    }
  }
}

let moveHandler = function(evt) {
  //get valid moves, check if there are any
  userArr = getValidMoves(board, color);
  console.log("valid moves: ", userArr);
  if(JSON.stringify(userArr) === JSON.stringify([])){
    //no valid moves, then click to skip turn.
    console.log("no valido morves");
    updateMessage("no valid moves for you, click to skip turn");
    let messageBox = document.body.querySelector('#gameMessage');
    messageBox.addEventListener('click', skipUserTurn);
  } else {
    console.log("EVENT: ", evt);
    let col = Array.from(evt.target.parentNode.children).indexOf(evt.target);
    let row = Array.from(evt.target.parentNode.parentNode.children).indexOf(evt.target.parentNode);
    let i = row * width + col;
    updateMessage("What's your move?");
    move = indexToRowCol(board, i);
    isMoveValid = isValidMove(board, color, move.row, move.col);
    console.log(isMoveValid);
    if(isMoveValid === false){
      updateMessage("Invalid Move");
      //move = readlineSync.question("\n What's your move?\n >");
      isMoveValid = isValidMove(board, color, move);
    }
    else {
      board = setBoardCell(board, color, move.row, move.col);
      cellsToFlip = getCellsToFlip(board, move.row, move.col);
      board = flipCells(board, cellsToFlip);
      isFull = isBoardFull(board);
      updateBoard();
      console.log(boardToString(board));
      let cells = document.querySelectorAll('.boardCell');
      cells.forEach(function(c, i, arr) {
        c.removeEventListener('click', moveHandler);
      });
      if(isFull){
        FinishGame();
      } else {
        ComputerMove();
      }
      //computer goes, update board
    }
  }
}

//the user move function
function UserMove(){
  //setup board initially main
	console.log(boardToString(board));
  //see if there are valid moves
	userArr = getValidMoves(board, color);
	if(JSON.stringify(userArr) === JSON.stringify([])){
    //no valid moves, then click to skip turn.
    updateMessage("no valid moves for you, click to skip turn");
    userPass = true;
    if(computerPass){
      FinishGame();
    }
    else {
      ComputerMove();
    }
	} else {
		userPass = false;
    updateMessage("What's your move?");
    //TODO: wait for player to click a cell
    let cells = document.querySelectorAll('.boardCell');
    console.log("cells: ", cells);
    cells.forEach(function(c, i, arr) {
      c.addEventListener('click', moveHandler);
    });
	}
}

function skipUserTurn(evt){
  let messageBox = document.body.querySelector('#gameMessage');
  messageBox.removeEventListener('click', skipUserTurn);
  userPass = true;
  opponentArr = getValidMoves(board, color);
  if(JSON.stringify(userArr) === JSON.stringify([])){
    computerPass = true;
  }
  if(computerPass){
    FinishGame();
  } else {
    let cells = document.querySelectorAll('.boardCell');
    cells.forEach(function(c, i, arr) {
      c.removeEventListener('click', moveHandler);
    });
    ComputerMove();
  }
}

function skipComputerTurn(evt){
  let messageBox = document.body.querySelector('#gameMessage');
  messageBox.removeEventListener('click', skipComputerTurn);
  computerPass = true;
  userArr = getValidMoves(board, color);
  if(JSON.stringify(userArr) === JSON.stringify([])){
    userPass = true;
  }
  if(userPass){
    FinishGame();
  }
  else{
    let cells = document.querySelectorAll('.boardCell');
    cells.forEach(function(c, i, arr) {
      c.addEventListener('click', moveHandler);
    });
    updateMessage("What's your move?");
  }
}

function letTheComputerMove(evt){
  let messageBox = document.body.querySelector('#gameMessage');
  messageBox.removeEventListener('click', letTheComputerMove);
  computerPass = false;
  move = {"row": opponentArr[0][0], "col": opponentArr[0][1]};
  board = setBoardCell(board, opponentColor, move.row, move.col);
  cellsToFlip = getCellsToFlip(board, move.row, move.col);
  board = flipCells(board, cellsToFlip);

  //update after flipping
  updateBoard();
  console.log(boardToString(board));
  isFull = isBoardFull(board);
  if(isFull){
    FinishGame();
  } else {
    let cells = document.querySelectorAll('.boardCell');
    cells.forEach(function(c, i, arr) {
      c.addEventListener('click', moveHandler);
    });
    updateMessage("What's your move?");
  }
}

//computer makes its move if possible, otherwise it passes
function ComputerMove(){
	//get valid moves
	opponentArr = getValidMoves(board, opponentColor);
  let messageBox = document.body.querySelector('#gameMessage');
	if(JSON.stringify(opponentArr) === JSON.stringify([])){
		move = null;
    updateMessage("No valid moves for computer, click here to skip turn...");
    messageBox.addEventListener('click', skipComputerTurn);
	} else {
    updateMessage("Click here to show computer's move...");
  	messageBox.addEventListener('click', letTheComputerMove);
	}
  console.log("computer move");
}

function InteractiveGame() {
	if(color === "X"){
		opponentColor = "O";
    console.log("color is X");
	}
	else{
		opponentColor = "X";
    console.log("color is O");
		ComputerMove();
	}
  UserMove();
}

function FinishGame(){
  // let cells = document.querySelectorAll('.boardCell');
  // cells.forEach(function(c, i, arr) {
  //   c.removeEventListener('click');
  // }
  let score = "";
  let cells = document.querySelectorAll('.boardCell');
  cells.forEach(function(c, i, arr) {
    c.removeEventListener('click', moveHandler);
  });
  console.log("game finished");
  const counts = getLetterCounts(board);
	const display = "Score<br>====<br>X: " + counts.X + "<br>O: " + counts.O + "<br>";
  console.log(display);
	if(counts.X > counts.O){
		if(color === "X"){
      updateMessage(display + "<br>You Win!");
      //socket.emit('win', );
      score = "win";
		}
		else{
      updateMessage(display + "<br>You Lose :(");
      score = "loss";
		}
	}
	if(counts.O > counts.X){
		if(color === "X"){
      updateMessage(display + "<br>You Lose :(");
      score = "loss";
		}
		else{
      updateMessage(display + "<br>You Win!");
      score = "win";
		}
	}
	if(counts.O === counts.X){
    updateMessage(display + "<br>Tie!");
		console.log("Tie!");
    score = "tie";
	}
  updatePlayerInfo(score);
}

function updatePlayerInfo(score){
  const url = 'http://linserv1.cims.nyu.edu:14394/api/gameroom/update?score=' + score + '&username=' + inSession;
  const req = new XMLHttpRequest();
  req.open('POST', url);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.addEventListener('load', function() {
    if(req.status >= 200 && req.status < 400){
      console.log("req responseText: ", req.responseText);
      const data = JSON.parse(req.responseText);
      //modify dom with new data
      console.log("data: ", data);
      appendMessage("---");
      appendMessage("total wins: " + data.wins);
      appendMessage("total losses: " + data.losses);
      appendMessage("# of games you've played: " + data.gamesPlayed);
    }
  });
  req.addEventListener('error', function() {
    console.log("errorrrr");
  });
  req.send();
}

function main(){
  //document.body.style.backgroundImage = "url('background.jpeg')";
  document.querySelector('.playBtn').addEventListener("click", function(event) {
    event.preventDefault();
    console.log("toggle");
    const myelement = document.querySelector('.start');
    myelement.style.display = 'none';
    //create board

    width = document.querySelector('#width').value;
    color = document.querySelector('#color').value;
    console.log("width: ", width, "color: ", color);
    ControlledGameSettings(width, color);
    DisplayBoard(board, width);
    InteractiveGame();
  });
}
document.addEventListener('DOMContentLoaded', main);
