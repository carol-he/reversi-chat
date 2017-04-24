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
      let cell = generateElement('td', 'boardCell', null, symbol, null);
      document.body.querySelectorAll('.boardRow')[i].appendChild(cell);
    }
  }
  messagebox = generateElement('div', null, 'gameMessage', message, null);
  document.body.appendChild(messagebox);
}

//updates message game gives player. message is a string
function updateMessage(message) {
  let messageBox = document.body.querySelector('#gameMessage');
  let newMessageBox = generateElement('div', null, 'gameMessage', message, null);
  messageBox.parentNode.replaceChild(newMessageBox, messageBox);
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
      document.body.querySelectorAll('.boardRow')[i].querySelectorAll('.boardCell')[j].innerHTML = symbol;
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
      finishGame();
    }
    else {
      computerMove();
    }
	} else {
		userPass = false;
    updateMessage("What's your move?");
    //TODO: wait for player to click a cell
    let cells = document.querySelectorAll('.boardCell');
    console.log("cells: ", cells);
    cells.forEach(function(c, i, arr) {
      c.addEventListener('click', function(evt) {
        updateMessage("What's your move?");
        move = indexToRowCol(board, i);
        console.log("HIIII", move);
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
          if(isFull){
            finishGame();
          }
          //computer goes, update board
          ComputerMove();
          updateBoard();
        	console.log(boardToString(board));
          isFull = isBoardFull(board);
          if(isFull){
            finishGame();
          }
          //get valid moves, check if there are any
          userArr = getValidMoves(board, color);
        	if(JSON.stringify(userArr) === JSON.stringify([])){
            //no valid moves, then click to skip turn.
            updateMessage("no valid moves for you, click to skip turn");
            userPass = true;
            if(computerPass){
              finishGame();
            } else {
              computerMove();
              updateBoard();
            }
        	}
          //once u update board, you gotta update cells
          //cells = document.querySelectorAll('.boardCell');
        }
      });
    });
	}
}

//computer makes its move if possible, otherwise it passes
function ComputerMove(){
	//get valid moves
	opponentArr = getValidMoves(board, opponentColor);
	if(JSON.stringify(opponentArr) === JSON.stringify([])){
		move = null;
    updateMessage("No valid moves for computer, press ENTER to skip turn...>");
		computerPass = true;
    if(userPass){
      finishGame();
    }
	} else {
	computerPass = false;
  updateMessage("Press ENTER to show computer's move...");
  function pressed(e)
  {
      if(e.keyCode === 13)
      {
          alert('enter pressed');
          //put button.click() here
      }
  }
  $(document).ready(function(){
    $(document).bind('keypress', pressed);
  });
	move = {"row": opponentArr[0][0], "col": opponentArr[0][1]};
	board = setBoardCell(board, opponentColor, move.row, move.col);
	cellsToFlip = getCellsToFlip(board, move.row, move.col);
	board = flipCells(board, cellsToFlip);
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

function finishGame(){
  console.log("game finished");
  const counts = getLetterCounts(board);
	console.log("Score\n====\nX: " + counts.X + "\nO: " + counts.O);
	if(counts.X > counts.O){
		if(color === "X"){
			console.log("You Win!");
		}
		else{
		console.log("You Lose :((");
		}
	}
	if(counts.O > counts.X){
		if(color === "X"){
			console.log("You Lose :((");
		}
		else{
		console.log("You Win!");
		}
	}
	if(counts.O === counts.X){
		console.log("Tie!");
	}
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
