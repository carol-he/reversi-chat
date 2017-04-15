// app.js

let move;
let color;
let opponentColor;
let coordMove;
let board;
let userArr;
let opponentArr;
let cellsToFlip;
let isMoveValid;
let isFull;
let userPass = false;
let computerPass = false;
let counts;

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
}

function UserMove(){
	console.log(boardToString(board));
	userArr = getValidMoves(board, color);
	if(JSON.stringify(userArr) === JSON.stringify([])){
		move = readlineSync.question("\n No valid moves for you, press <ENTER> to skip turn...\n>");
		userPass = true;
	} else {
		userPass = false;
		move = readlineSync.question("\n What's your move?\n >");
		isMoveValid = isValidMoveAlgebraicNotation(board, color, move);
		while(isMoveValid !== true){
			if(isMoveValid === false){
				console.log("Invalid Move\n");
			}
			move = readlineSync.question("\n What's your move?\n >");
			isMoveValid = isValidMoveAlgebraicNotation(board, color, move);
		}
		if(isMoveValid === true){
			board = placeLetter(board, color, move);
			coordMove = algebraicToRowCol(move);
			cellsToFlip = getCellsToFlip(board, coordMove.row, coordMove.col);
			board = flipCells(board, cellsToFlip);
		}
	}
	console.log(boardToString(board));
}

function ComputerMove(){
	//get valid moves
	opponentArr = getValidMoves(board, opponentColor);
	if(JSON.stringify(opponentArr) === JSON.stringify([])){
		move = readlineSync.question("\n No valid moves for computer, press <ENTER> to skip turn...\n>");
		computerPass = true;
	} else {
	computerPass = false;
	readlineSync.question("\nPress <ENTER> to show computer's move...\n>");
	coordMove = {"row": opponentArr[0][0], "col": opponentArr[0][1]};
	board = setBoardCell(board, opponentColor, coordMove.row, coordMove.col);
	cellsToFlip = getCellsToFlip(board, coordMove.row, coordMove.col);
	board = flipCells(board, cellsToFlip);
	}
}

function InteractiveGame() {
	if(color === "X"){
		opponentColor = "O";
	}
	else{
		opponentColor = "X";
		ComputerMove();
	}
	isFull = isBoardFull(board);
	while(isFull === false && !(userPass && computerPass)){
		UserMove();
		isFull = isBoardFull(board);
		ComputerMove();
		isFull = isBoardFull(board);
	}
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

// if(process.argv.length = 2){
// 	ControlledGameSettings();
// 	InteractiveGame();
// }

//else if(process.argv.length > 2){
function ReadConfigFile(){
	fs.readFile(process.argv[2], 'utf8', function(err, data){
		if (err) {
		console.log('uh oh', err);
		} else {
			console.log(data);
			const jsonFile = JSON.parse(data);
			color = jsonFile.boardPreset.playerLetter;
			board = jsonFile.boardPreset.board;
			const numComp = jsonFile.scriptedMoves.computer.length;
			const numPlayer = jsonFile.scriptedMoves.player.length;
			console.log(numPlayer);
			let countComp = 0;
			let countPlayer = 0;
			isFull = isBoardFull(board);
			console.log(boardToString(board));
			if(color === "O"){
				move = jsonFile.scriptedMoves.computer[0];
				console.log("Computer move to " + move + " is scripted.");
				readlineSync.question("Press <Enter> to show computer's move...");
				board = placeLetter(board, opponentColor, move);
				coordMove = algebraicToRowCol(move);
				cellsToFlip = getCellsToFlip(board, coordMove.row, coordMove.col);
				board = flipCells(board, cellsToFlip);
				console.log(boardToString(board));
				countComp++;
				opponentColor = "X";
			} else {
				opponentColor = "O";
			}
			while(isFull === false && !(userPass && computerPass)){
				if((numPlayer - countPlayer) > 0){
					move = jsonFile.scriptedMoves.player[countPlayer];
					counts = getLetterCounts(board);
					console.log("Score\n====\nX: " + counts.X + "\nO: " + counts.O + "\n");
					console.log("Player move to " + move + " is scripted.");
					readlineSync.question("Press <Enter> to continue.");
					board = placeLetter(board, color, move);
					coordMove = algebraicToRowCol(move);
					cellsToFlip = getCellsToFlip(board, coordMove.row, coordMove.col);
					board = flipCells(board, cellsToFlip);
					console.log(boardToString(board));
					countPlayer++;
					} else {
						UserMove();
				}

				isFull = isBoardFull(board);
				if((numComp - countComp) > 0){
					move = jsonFile.scriptedMoves.computer[countComp];
					counts = getLetterCounts(board);
					console.log("Score\n====\nX: " + counts.X + "\nO: " + counts.O + "\n");
					console.log("Computer move to " + move + " is scripted.");
					readlineSync.question("Press <Enter> to show computer's move...");
					board = placeLetter(board, opponentColor, move);
					coordMove = algebraicToRowCol(move);
					cellsToFlip = getCellsToFlip(board, coordMove.row, coordMove.col);
					board = flipCells(board, cellsToFlip);
					console.log(boardToString(board));
					countComp++;
				} else {
					ComputerMove();
				}

				isFull = isBoardFull(board);
			}
			counts = getLetterCounts(board);
			console.log("Score\n====\nX: " + counts.X + "\nO: " + counts.O + "\n");
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
	});
}

function main(){
  //document.body.style.backgroundImage = "url('background.jpeg')";
  document.querySelector('.playBtn').addEventListener("click", function(event) {
    event.preventDefault();
    console.log("toggle");
    const myelement = document.querySelector('.start');
    myelement.style.display = 'none';
    //create board
    const width = document.querySelector('#width').value;
    const color = document.querySelector('#color').value;
    console.log("width: ", width, "color: ", color);
    ControlledGameSettings(width, color);
    DisplayBoard(board, width);
  });
}
document.addEventListener('DOMContentLoaded', main);
