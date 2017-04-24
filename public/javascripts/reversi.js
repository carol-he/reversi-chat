// reversi.js
function repeat(value, n) {
    const numbers = [];
    for (let i = 0; i < n; i++) {
        numbers.push(value);
    }
    return numbers;
}

function generateBoard(rows, cols, initialValue) {
    const board = repeat(initialValue, rows*cols);
    return board;
}

function rowColToIndex(board, rowNumber, columnNumber){
	const length = Math.sqrt(board.length);
	return length*rowNumber + columnNumber;
}

function indexToRowCol(board, i){
	const length = Math.sqrt(board.length);
	const row = Math.floor(i / length);
	const col = i % length;
	return {"row": row, "col": col};
}

function setBoardCell(board, letter, row, col){
    const board2 = board.slice();
	board2[rowColToIndex(board, row, col)] = letter;
    return board2;
}

function algebraicToRowCol(algebraicNotation){
    let col = 0;
    let row = 0;
    if(algebraicNotation[0].charCodeAt(0) >= 65 && algebraicNotation[0].charCodeAt(0) <= 90){
        //good
        col = algebraicNotation[0].charCodeAt(0) - 65;
        //
        if(algebraicNotation.length === 2 && algebraicNotation[1] > 0 && algebraicNotation[1] < 10){
            row = algebraicNotation[1] - 1;
            const coord = {
                "row": row,
                "col": col,
            };
            return coord;
        }
        if(algebraicNotation.length === 3 && algebraicNotation[1] > 0 && algebraicNotation[1] < 10 && algebraicNotation[2] >= 0 && algebraicNotation[1] < 10){
            if(algebraicNotation[1] === 2){
                if(algebraicNotation[2] > 6){
                    return undefined;
                }
            }
            if(algebraicNotation[1] > 2){
                return undefined;
            }
            row = parseInt(algebraicNotation[1]) * 10 + parseInt(algebraicNotation[2]) - 1;
            const coord = {
                "row": row,
                "col": col,
            };
            return coord;
        }
    }
    return undefined;
}

function placeLetter(board, letter, algebraicNotation){
    const coordinate = algebraicToRowCol(algebraicNotation);
    if(coordinate === undefined){
        return board;
    }
    const board2 = setBoardCell(board, letter, coordinate.row, coordinate.col);
    return board2;
}

function placeLetters(board, letter, ...algebraicNotation){
    let coordinate;
    let board2 = board;
    algebraicNotation.forEach((ele) => {
        coordinate = algebraicToRowCol(ele);
        board2 = setBoardCell(board2, letter, coordinate.row, coordinate.col);
    });
    return board2;
}

function boardToString(board){
    let stringBoard = "    ";
    let letter = 65;
    const length = Math.sqrt(board.length);
    for(let i = 0; i < length; i++){
        stringBoard = stringBoard + " " + String.fromCharCode(letter) + "  ";
        letter++;
    }
    let rownum = 1;
    stringBoard = stringBoard + "\n";
    for(let i = 0; i < length; i++){
        stringBoard = stringBoard + "   ";
        for(let j = 0; j < length; j++){
            stringBoard = stringBoard + "+---";
        }
        stringBoard = stringBoard + "+\n " + rownum;
        rownum++;
        for(let j = 0; j < length; j++){
            stringBoard = stringBoard + " | " + board[rowColToIndex(board, i, j)];
        }
        stringBoard = stringBoard + " |\n";
    }
    stringBoard = stringBoard + "   ";
    for(let i = 0; i < length; i++){
        stringBoard = stringBoard + "+---";
    }
    stringBoard = stringBoard + "+\n";
    return stringBoard;
}
function isBoardFull(board){
    for(let i = 0; i < board.length; i++){
        if(board[i] === " "){
            return false;
        }
    }
    return true;
}

function flip(board, row, col){
    const i = rowColToIndex(board, row, col);
    if(board[i] === "X"){
        board = setBoardCell(board, "O", row, col);
    }
    else if(board[i] === "O"){
        board = setBoardCell(board, "X", row, col);
    }
    return board;
}

function flipCells(board, cellsToFlip){
    for(let i = 0; i < cellsToFlip.length; i++){
        for(let j = 0; j < cellsToFlip[i].length; j++){
            board = flip(board, cellsToFlip[i][j][0], cellsToFlip[i][j][1]);
        }
    }
    return board;
}

function getCellsToFlip(board, lastRow, lastCol){
    //u have the coordinates
    const coord = rowColToIndex(board, lastRow, lastCol);
    const adjacentUpper = rowColToIndex(board, lastRow - 1, lastCol);
    const adjacentLower = rowColToIndex(board, lastRow + 1, lastCol);
    const adjacentRight = rowColToIndex(board, lastRow, lastCol + 1);
    const adjacentLeft = rowColToIndex(board, lastRow, lastCol - 1);

    const adjacentUpperRight = rowColToIndex(board, lastRow - 1, lastCol + 1);
    const adjacentUpperLeft = rowColToIndex(board, lastRow - 1, lastCol - 1);
    const adjacentLowerRight = rowColToIndex(board, lastRow + 1, lastCol + 1);
    const adjacentLowerLeft = rowColToIndex(board, lastRow + 1, lastCol - 1);

    const length = Math.sqrt(board.length);
    const arr = new Array();
    let arrIndex = 0;
    let check;
    let notDefined = true;
    //check up and down
    //up
    if(lastRow !== 0 && board[adjacentUpper] !== board[coord] && board[adjacentUpper] !== " "){
        for(let i = lastRow - 1; i >= 0; i--){
            check = rowColToIndex(board, i, lastCol);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === 0){
                check = undefined;
                break;
            }
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        for(let i = lastRow - 1; i > check.row; i--){
            arr[arrIndex].push([i, check.col]);
            notDefined = false;
        }
        arrIndex++;
    }

    //lower
    if(lastRow !== length - 1 && board[adjacentLower] !== board[coord] && board[adjacentLower] !== " "){
        for(let i = lastRow + 1; i < length; i++){
            check = rowColToIndex(board, i, lastCol);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === length - 1){
                check = undefined;
                break;
            }
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        for(let i = lastRow + 1; i < check.row; i++){
            arr[arrIndex].push([i, check.col]);
            notDefined = false;
        }
        arrIndex++;
    }
    //check left and right
    //left
    if(lastCol !== 0 && board[adjacentLeft] !== board[coord] && board[adjacentLeft] !== " "){
        for(let i = lastCol - 1; i >= 0; i--){
            check = rowColToIndex(board, lastRow, i);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === 0){
                check = undefined;
                break;
            }
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        arr[arrIndex] = new Array();
        check = indexToRowCol(board, check);
        for(let i = lastCol - 1; i > check.col; i--){
            arr[arrIndex].push([check.row, i]);
            notDefined = false;
        }
        arrIndex++;
    }
    //right
    if(lastCol !== length - 1 && board[adjacentRight] !== board[coord] && board[adjacentRight] !== " "){
        for(let i = lastCol + 1; i < length; i++){
            check = rowColToIndex(board, lastRow, i);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === length - 1){
                check = undefined;
                break;
            }
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        for(let i = lastCol + 1; i < check.col; i++){
            arr[arrIndex].push([check.row, i]);
            notDefined = false;
        }
        arrIndex++;
    }
    //check diagonal
    //upper right
    let j = lastCol + 1; //++, < length
    if(lastRow !== 0 && lastCol !== length - 1 && board[adjacentUpperRight] !== board[coord] && board[adjacentUpperRight] !== " "){
        for(let i = lastRow - 1; i >= 0; i--){
            check = rowColToIndex(board, i, j);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === 0){
                check = undefined;
                break;
            }
            if(j === length - 1){
                check = undefined;
                break;
            }
            j++;
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        j = lastCol + 1; // < check.col, j++
        for(let i = lastRow - 1; i > check.row; i--){
            arr[arrIndex].push([i, j]);
            notDefined = false;
            if(j === check.col - 1){
                break;
            }
            j++;
        }
        arrIndex++;
    }
    //upper left

    j = lastCol - 1; //--, >= 0
    if(lastRow !== 0 && lastCol !== 0 && board[adjacentUpperLeft] !== board[coord] && board[adjacentUpperLeft] !== " "){
        for(let i = lastRow - 1; i >= 0; i--){
            check = rowColToIndex(board, i, j);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === 0){
                check = undefined;
                break;
            }
            if(j === 0){
                check = undefined;
                break;
            }
            j--;
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        j = lastCol - 1; // > check.col, j--
        for(let i = lastRow - 1; i > check.row; i--){
            arr[arrIndex].push([i, j]);
            notDefined = false;
            if(j === check.col + 1){
                break;
            }
            j--;
        }
        arrIndex++;
    }
    //lower right

    j = lastCol + 1;
    if(lastRow !== length - 1 && lastCol !== length - 1 && board[adjacentLowerRight] !== board[coord] && board[adjacentLowerRight] !== " "){
        for(let i = lastRow + 1; i < length; i++){
            check = rowColToIndex(board, i, j);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === length - 1){
                check = undefined;
                break;
            }
            if(j === length - 1){
                check = undefined;
                break;
            }
            j++;
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        j = lastCol + 1; // < check.col, j++
        for(let i = lastRow + 1; i < check.row; i++){
            arr[arrIndex].push([i, j]);
            notDefined = false;
            if(j === check.col - 1){
                break;
            }
            j++;
        }
        arrIndex++;
    }

    //lower left
    j = lastCol - 1; //--, >= 0
    if(lastRow !== length - 1 && lastCol !== 0 && board[adjacentLowerLeft] !== board[coord] && board[adjacentLowerLeft] !== " "){
        for(let i = lastRow + 1; i < length; i++){
            check = rowColToIndex(board, i, j);
            if(board[check] === " "){
                check = undefined;
                break;
            }
            if(board[check] === board[coord]){
                break;
            }
            if(i === length - 1){
                check = undefined;
                break;
            }
            if(j === 0){
                check = undefined;
                break;
            }
            j--;
        }
    } else {
        check = undefined;
    }
    if(check !== undefined){
        check = indexToRowCol(board, check);
        arr[arrIndex] = new Array();
        j = lastCol - 1; // < check.col, j++
        for(let i = lastRow + 1; i < check.row; i++){
            arr[arrIndex].push([i, j]);
            notDefined = false;
            if(j === check.col + 1){
                break;
            }
            j--;
        }
        arrIndex++;
    }

    if(notDefined === true){
        return [];
    }
    return arr;
}

function isValidMove(board, letter, row, col){
    const i = rowColToIndex(board, row, col);
    if(board[i] === " "){
        board[i] = letter;
        if(JSON.stringify(getCellsToFlip(board, row, col)) !== JSON.stringify([])){
            board[i] = " ";
            return true;
        }
        board[i] = " ";
    } else {
        return false;
    }
    return false;
}

function isValidMoveAlgebraicNotation(board, letter, algebraicNotation){
    const x = algebraicToRowCol(algebraicNotation);
    if(x === undefined){
        return false;
    }
    const valid = isValidMove(board, letter, x.row, x.col);
    return valid;
}

function getLetterCounts(board){
    let countX = 0;
    let countO = 0;
    for(let i = 0; i < board.length; i++){
        if(board[i] === "X"){
            countX++;
        }
        if(board[i] === "O"){
            countO++;
        }
    }
    const count = {
        X: countX,
        O: countO
    };
    return count;
}

function getValidMoves(board, letter){
    const arr = new Array();
    for(let i = 0; i < board.length; i++){
        const x = indexToRowCol(board, i);
        if(isValidMove(board, letter, x.row, x.col)){
            arr.push([x.row, x.col]);
        }
    }
    return arr;
}

// ...
