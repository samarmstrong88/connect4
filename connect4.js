
//constants
const COLS = 7; 
const ROWS = 6;
const EMPTY_PIECE = 0;
const PLAYER1 = 1;
const PLAYER2= 2;
const CELL_RADIUS = 0.4; //radius as percentage of total cell i.e. 80%
const PADDING = 10; //padding is 10px inside canvas
const WINNING_NUMBER = 4
let current_player = PLAYER1;

//Create an game_array of columns - each individual array in the game array is one COLUMN
//This allows each sub-array to 'fill' during gameplay, rather than filling into different arrays,
//which would occur if the game array was an array of rows.
let game_array = new Array(COLS)
for (let i = 0; i < COLS; i++) {
  game_array[i] = new Array(ROWS).fill(0);
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
  //set dimensions of game 
  //width: = 7 rows + margin
  //height = 6 cols + margin
  //if w> h then 
  //




  //check width and height of canvas, to see which is constraining the size
  //use the shorter of the two define cell size
  // draw the background over full size
  // draw the grid with a margin
  // draw the circles over the grid by using the game_array


  //TODO use requestAnimationFrame to animate  later


  
  ctx.fillStyle = 'blue';  
  ctx.fillRect(0,0, canvas.width, canvas.height); 


}

function drawGrid() {

  const fillStyles = {0: 'lightgrey', 1: 'red', 2: 'yellow'};
  let cell_width = canvas.width / COLS;
  let hole_radius = cell_width * CELL_RADIUS;

  for (let i=0; i< game_array.length; i++) { //iterate column
    for (let j=0; j < game_array[i].length; j++) { //iterate row
      // console.log(i,j);
      ctx.beginPath();
      let player = game_array[i][j];
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
  if (game_array[col].lastIndexOf(0)>= 0) { //if free spot
    makeMove(game_array, col, current_player)
    current_player = (current_player === PLAYER1 ? PLAYER2 : PLAYER1) //switch current player
    draw();
  }
}

function makeMove(game_array, col, current_player) {
  //Pure Fn
  let row = game_array[col].lastIndexOf(0); //find last free spot in the array. Returns -1 if no free spots
  game_array[col][row] = current_player; //fill spot with players piece
  checkWin(game_array, current_player, col, WINNING_NUMBER)
  //todo -Does this need a check to test for if move is possible?

}

function resetGrid() {
  //Impure fn- effects array, which is not passed
  //reset the game array to be empty (all 0s)
  game_array = new Array(COLS)
  for (let i = 0; i < COLS; i++) {
    game_array[i] = new Array(ROWS).fill(0);
  }
  current_player = PLAYER1;
  draw();
}

function checkWin(game_array, player, col) {
  //Pure Fn
  //Fn to check if the last move won the game. Only the last move can win, so limits the checks needed.
  //create a substring to match for the win case
  let cols = game_array.length;
  let rows = game_array[0].length
  let winningStr = player.toString().repeat(WINNING_NUMBER);
  let moveX = col;
  let moveY = game_array[col].lastIndexOf(0);

  let verticalStr = game_array[moveX].join('');

  let horizontalStr = '';
  for (let i=0; i< game_array.length; i++) {
    horizontalStr +=game_array[i][moveY];
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
    posDiagStr += game_array[tempX][tempY];
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
    negDiagStr += game_array[tempX][tempY];
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

function getMoves(game_array) {
  let validMoves = [];
  for(let i=0; i < game_array.length; i++) {
    if (game_array[i][0] == 0) {
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

function AImove(game_array) {
  let moves = getMoves();
  if (moves.length === 1) {
    makeMove(game_array, moves[0], PLAYER2)
  }
  else {
    [move, score] = minmax(game_array, AI_DEPTH, true);
    makeMove(game_array, move, PLAYER2);
    current_player = (current_player === PLAYER1 ? PLAYER2 : PLAYER1) //switch current player
    draw();
  }
}

function minmax(game_array, depth, maxPlayer) {
  let moves = getMoves(game_array);
  if (depth === 0 || moves.length === 0) { //no moves left,or terminal condition
    return checkWin(game_array, PLAYER1,  moves[0])
  }

}

function getScore() {
  //Fn to get relative score of a position - win is highest +ve, lose is highest -ve
}




window.addEventListener('resize', resize);
window.addEventListener('load', resize);

canvas.addEventListener('click', handleGameClick);

let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', resetGrid)
