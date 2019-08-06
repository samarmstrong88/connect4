
//constants
const COLS = 7; 
const ROWS = 6;
const EMPTY_PIECE = 0;
const PLAYER1 = 1;
const PLAYER2 = 2; //AI PIECE
const CELL_RADIUS = 0.4; //radius as percentage of total cell i.e. 80%
const PADDING = 10; //padding is 10px inside canvas
const WINNING_NUMBER = 4
const AI_DEPTH = 4;
let current_player = PLAYER1;

//Create an gameArray of columns - each individual array in the game array is one COLUMN
//This allows each sub-array to 'fill' during gameplay, rather than filling into different arrays,
//which would occur if the game array was an array of rows.
let gameArray = new Array(COLS)
for (let i = 0; i < COLS; i++) {
  gameArray[i] = new Array(ROWS).fill(0);
}

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d');
canvas.height = 600;
canvas.width = 700;
//create resizer that calls draw when window changes size



function draw() {
  drawBackground();
  drawGrid();
}


function resize() {
  //check available height and width of window
  let canvasRect = canvas.getBoundingClientRect();
  let topY = canvasRect.top;  
  let x = window.innerWidth;
  let y = window.innerHeight - topY;
  
  if ((x-2*PADDING)/7 > (y-2*PADDING) / 6) {
    canvas.height = y;
    canvas.width = (y-2*PADDING)*(7/6) +2*PADDING
  }
  else {
    canvas.width = x;
    canvas.height = (x-2*PADDING)*(6/7) + 2*PADDING;
  }
 draw();
}

function drawBackground() {
  ctx.fillStyle = 'blue';  
  ctx.fillRect(0,0, canvas.width, canvas.height); 
}

function drawGrid() {

  const fillStyles = {0: 'lightgrey', 1: 'red', 2: 'yellow'};
  let cell_width = canvas.width / COLS;
  let hole_radius = cell_width * CELL_RADIUS;

  for (let i=0; i< gameArray.length; i++) { //iterate column
    for (let j=0; j < gameArray[i].length; j++) { //iterate row
      ctx.beginPath();
      let player = gameArray[i][j];
      let color = fillStyles[player]
      let x = cell_width / 2 + i * cell_width;
      let y = cell_width /2 + j * cell_width;
      ctx.fillStyle = color;
      ctx.moveTo(x,y);
      ctx.arc(x, y, hole_radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  
}



function handleGameClick(e) {
  //Impure Fn
  let col = getColumn(e);
  if (gameArray[col].lastIndexOf(0)>= 0) { //if free spot
    makeMove(gameArray, col, PLAYER1);
    draw();
    checkWin(gameArray, PLAYER1, col, WINNING_NUMBER);
    AImove(gameArray, WINNING_NUMBER);
    draw();
    // current_player = (current_player === PLAYER1 ? PLAYER2 : PLAYER1) //switch current player
  }
}

function makeMove(gameArray, col, current_player) {
  //Pure Fn
  let row = gameArray[col].lastIndexOf(0); //find last free spot in the array. Returns -1 if no free spots
  gameArray[col][row] = current_player; //fill spot with players piece
  

}

function resetGrid() {
  //Impure fn- effects array, which is not passed
  //reset the game array to be empty (all 0s)
  gameArray = new Array(COLS)
  for (let i = 0; i < COLS; i++) {
    gameArray[i] = new Array(ROWS).fill(0);
  }
  current_player = PLAYER1;
  draw();
}

function checkWin(gameArray, player, col, winningScore) {
  //Pure Fn
  //Fn to check if the last move won the game. Only the last move can win, so limits the checks needed.
  //create a substring to match for the win case
  let cols = gameArray.length;
  let rows = gameArray[0].length
  let winningStr = player.toString().repeat(winningScore);
  let moveX = col;
  let moveY = gameArray[col].lastIndexOf(0) +1;

  let verticalStr = gameArray[moveX].join('');

  let horizontalStr = '';
  for (let i=0; i< gameArray.length; i++) {
    horizontalStr +=gameArray[i][moveY];
  }
  
  // Find the starting edge position of +ve diagonal that passes through the move point
  let posDiagStr = ''
  let tempX = moveX, tempY = moveY;
  while (tempX > 0 && tempY > 0) {
    tempX--;
    tempY--;
  }
  //Iterate over the diagonal through the move point, and append to the check string
  while (tempX < cols && tempY < rows) {
    posDiagStr += gameArray[tempX][tempY];
    tempX ++;
    tempY ++;
  }
  // Find the starting edge position of +ve diagonal that passes through the move point
  let negDiagStr = '';
  tempX = moveX, tempY = moveY;
  while (tempX > 0 && tempY < rows -1) {
    tempX--;
    tempY++;
  }
  //Iterate over the diagonal through the move point, and append to the check string
  while (tempX < cols && tempY >= 0) {
    negDiagStr += gameArray[tempX][tempY];
    tempX++;
    tempY--;
  }
  //Checks
  if (verticalStr.indexOf(winningStr) >= 0) {
    console.log('win vertical for player', player)
    return true;
  }
  if (horizontalStr.indexOf(winningStr) >= 0) {
    console.log('Win horizontal for player', player)
    return true;
  }
  if (posDiagStr.indexOf(winningStr) >= 0 || negDiagStr.indexOf(winningStr) >= 0) {
    console.log('Win diagonal for player', player)
    return true;
  }
}

function getMoves(gameArray) {
  let validMoves = [];
  for(let i=0; i < gameArray.length; i++) {
    if (gameArray[i][0] == 0) {
      validMoves.push(i);
    }
  }
  return validMoves;
}

function getColumn(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  return Math.floor(x/(canvas.width/COLS));
}

function AImove(gameArray, winningScore) {
  let moves = getMoves(gameArray);
  if (typeof moves == 'undefined') {
    // console.log('no moves undef')
  }
  if (moves.length === 1) {
    // console.log('1move')
    makeMove(gameArray, moves[0], PLAYER2)
    checkWin(gameArray, PLAYER2, move, winningScore)
    draw();
  }
  else if (moves.length > 1) {
    // console.log('1+moves', moves)
    let [score, move] = minmax(gameArray, AI_DEPTH, true);
    if (move >=0) {
      console.log(move)
      makeMove(gameArray, move, PLAYER2);
      checkWin(gameArray, PLAYER2, move, winningScore)
      draw();
    }
  }
  else console.log('No moves')
}

function minmax(gameArray, depth, maxPlayer) {
  //terminal conditions - if the current board has a win/loss condition, break recursion and return
  //large +ve or -ve result

  let staticScore = getScore(gameArray,4); 
  if (staticScore >= 10000) {//if win/loss condition, stop and return
    return [1000000000,-1]
  }
  else if (staticScore <= -10000) { 
    return [-1000000000,-1]
  }
  //Get array of possible moves (columns with empty spots)
  let moves = getMoves(gameArray);
  if (depth === 0 || moves.length === 0) { //no moves left,or terminal condition
    let score = getScore(gameArray, 4);
    return [score, -1]
  }
  //Maximizing player(AI)
  else if (maxPlayer) {
    let bestScore = -1000000000000;
    let bestMove;
    for (let i=0; i<moves.length; i++) { 
      let move = moves[i]; //for each possible move
      let tempArr = new Array(gameArray.length); //create a temp game array - destroyed after every loop
      for (let i=0; i<gameArray.length; i++) { //copy the game array into temp array
        tempArr[i] = gameArray[i].slice();
      }
      makeMove(tempArr, move, PLAYER2) //make the move on the temp array
      
      let [eva, newMove] = minmax(tempArr, depth -1, false)
        if (eva > bestScore) {
          bestScore = eva;
          bestMove = move;
        }
      }
      return [bestScore, bestMove];
    }

    //Minimizing player (simulating player)
  else {
    let bestScore = 1000000000000;
    let bestMove;
    for (let i=0; i<moves.length; i++) { 
      let move = moves[i]; //for each possible move
      let tempArr = new Array(gameArray.length); //create a temp game array - destroyed after every loop
      for (let i=0; i<gameArray.length; i++) {
        tempArr[i] = gameArray[i].slice();
      }
      makeMove(tempArr, move, PLAYER1) //make the move on the temp array

      let [eva, newMove] = minmax(tempArr, depth -1, true)
        if (eva < bestScore) {
          bestScore = eva;
          bestMove = move;
        }
      }
      return [bestScore, bestMove];

  }

}

function getScore(gameArray, winningScore) {
  let score = 0;
  //Fn to get relative score of a position - win is highest +ve, lose is highest -v
  //If there is a 4 in a row (win) returns max +ve
  //Otherwise counts number of 2 and 3 in a rows for each player

  function scoreSubArr(arr) {
    // console.log(arr)
    let count = [0,0,0]; //[#empty, #player1, #player2]
    let score = 0;
    for (let i=0; i <arr.length; i++){
      count[arr[i]]++; //iterates through the array and adds count to the count array
    }
    if (count[1]===4) {
      return -100000
    } //player win 
    else if (count[1]===3 && count[2]===0) return -1000; //player 3-in-row
    else if (count[1]===2 && count[2]===0) return -10 //player 2-in-row
    else if (count[1]===0 && count[2]===2) return 10; //AI 2-in-row
    else if (count[1]===0 && count[2]===3) return 1000; //AI 3-in-row
    else if (count[2]===4) {
      return 100000
    } //AI-win
    else return 0; //draw- no 2+s in-a-row, or subarray has both pieces, so can't win for either player
    
  }

  let cols = gameArray.length;
  let rows = gameArray[0].length;

  //vertical

  for (let i=0; i<cols; i++) {
    for (let j =0; j <= rows - winningScore; j++) {
      if (gameArray[i][j+2] > 0) {
        score += scoreSubArr(gameArray[i].slice(j, j+4))
      }
    }
  }
  

  //horizontal
  for (let i=0; i<= cols - winningScore; i++) {
    for (let j=0; j< rows; j++) {
      let subArr = new Array(winningScore)
      for (let k=0; k < winningScore; k++) {
        subArr[k] = gameArray[i+k][j]
      }
      score += scoreSubArr(subArr);
    }
  }



  //+ve diagonal
  //only points at least 4 away from the far edge can have a win- so only check these points

  for (let i=0; i<= cols- winningScore; i++) {
    for (let j=0; j <= rows - winningScore; j++) {
      let subArr = new Array(winningScore)
      for (let k=0; k < winningScore; k++) {
        subArr[k] = gameArray[i+k][j+k];
      }
      
      score += scoreSubArr(subArr);
    }
  }

  //-ve diagonal
  for (let i=0; i<= cols- winningScore; i++) {
    for (let j=rows -1; j > rows - winningScore; j--) {
      let subArr = new Array(winningScore)
      for (let k=0; k < winningScore; k++) {
        subArr[k] = gameArray[i+k][j-k];
      }
      score += scoreSubArr(subArr);


    }
  }

  
  


  return score;
}




window.addEventListener('resize', resize);
window.addEventListener('load', resize);

canvas.addEventListener('click', handleGameClick);

let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', resetGrid)
