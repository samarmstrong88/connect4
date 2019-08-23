
//constants
const connect4 = (() => {
    
  const COLS = 7; 
  const ROWS = 6;
  const EMPTY_PIECE = 0;
  const PLAYER1 = 1;
  const PLAYER2 = 2; //AI PIECE
  const CELL_RADIUS = 0.4; //radius as percentage of total cell i.e. 80%
  const PADDING = 10; //padding is 10px inside canvas
  const WINNING_NUMBER = 4
  const AI_DEPTH = 4;
  const current_player = PLAYER1;
  const validMoves = true;
  const gameState = {
    winningPlayer: null,
    winningPos: [],
    animatingDrop: false,
  } 


  /*Create an gameArray of columns - each individual array in the game array is one column
  This allows each sub-array to 'fill' during gameplay, rather than filling into different arrays,
  which would occur if the game array was an array of rows. */
  const gameArray = new Array(COLS)
  for (let i = 0; i < COLS; i++) {
    gameArray[i] = new Array(ROWS).fill(0);
  }

  const canvasWrapper = document.getElementById('canvas-wrapper');
  const gamePieceCanvas = document.createElement('canvas');
  const frameCanvas = document.createElement('canvas');
  const backgroundCanvas = document.createElement('canvas');
  gamePieceCanvas.id = 'game-piece-canvas';
  frameCanvas.id = 'frame-canvas';
  backgroundCanvas.id = 'background-canvas'

  canvasWrapper.appendChild(gamePieceCanvas);
  canvasWrapper.appendChild(frameCanvas);  
  canvasWrapper.appendChild(backgroundCanvas);

  const ctxGame = gamePieceCanvas.getContext('2d');
  const ctxFrame = frameCanvas.getContext('2d');
  const ctxBackground = backgroundCanvas.getContext('2d');

 
  



  function draw() {
    drawFrame();
    drawBackground();
    drawGamePieces(gameArray);
  }


  function resize() {
    //check available height and width of window
    let canvasRect = gamePieceCanvas.getBoundingClientRect();
    let topY = canvasRect.top;  
    let x = window.innerWidth;
    let y = window.innerHeight - topY;

    if (x>y) {
      backgroundCanvas.width = gamePieceCanvas.width = frameCanvas.width = y
      backgroundCanvas.height = gamePieceCanvas.height = frameCanvas.height = y
    }
    else {
      backgroundCanvas.width = gamePieceCanvas.width = frameCanvas.width = x
      backgroundCanvas.height = gamePieceCanvas.height = frameCanvas.height = x
    }
    
    // if ((x-2*PADDING)/7 > (y-2*PADDING) / 6) {
    //   gamePieceCanvas.height = frameCanvas.height = y;
    //   gamePieceCanvas.width = frameCanvas.width = (y-2*PADDING)*(7/6) +2*PADDING
    // }
    // else {
    //   gamePieceCanvas.width = frameCanvas.width =  x;
    //   gamePieceCanvas.height = frameCanvas.height = (x-2*PADDING)*(6/7) + 2*PADDING;
    // }
  draw();
  }

  function drawFrame() {
    let cell_width = gamePieceCanvas.width / COLS;
    let hole_radius = cell_width * CELL_RADIUS;
    
    ctxFrame.beginPath();
    ctxFrame.fillStyle = 'blue';  
    ctxFrame.fillRect(0, cell_width, frameCanvas.width, frameCanvas.height); 
    ctxFrame.save()
   
    

     for (let i=0; i< gameArray.length; i++) {
      for (let j=0; j < gameArray[i].length; j++) { 
        let x = cell_width / 2 + i * cell_width;
        let y = cell_width /2 + (j+1) * cell_width;
        
        ctxFrame.globalCompositeOperation="xor";
        ctxFrame.beginPath();
        ctxFrame.moveTo(x,y)
        ctxFrame.arc(x, y, hole_radius, 0, 2 * Math.PI, true); 
        ctxFrame.fill();
      }
    }
    ctxFrame.restore();

    if (gameState.winningPos.length > 1) {
      ctxFrame.beginPath();
      ctxFrame.lineWidth =  10;
      let winLine = gameState.winningPos;
      let color = 'black';
      let xStart = cell_width / 2 + winLine[0] * cell_width;
      let yStart = cell_width / 2 + winLine[1] * cell_width;
      let xEnd = cell_width / 2 + winLine[2] * cell_width;
      let yEnd = cell_width / 2 + winLine[3] * cell_width;

      ctxFrame.moveTo(xStart, yStart)
      ctxFrame.lineTo(xEnd, yEnd);
      ctxFrame.stroke();
    }
    

  }
  function drawBackground() {
    ctxBackground.beginPath();
    ctxBackground.fillStyle = 'lightgray';
    ctxBackground.fillRect(0,0, backgroundCanvas.width, backgroundCanvas.height);
  }

  function drawGamePieces(gameArray) {

    const fillStyles = {0: 'lightgrey', 1: 'red', 2: 'yellow'};
    let cell_width = gamePieceCanvas.width / COLS;
    let hole_radius = cell_width * CELL_RADIUS;

    for (let i=0; i< gameArray.length; i++) {
      for (let j=0; j < gameArray[i].length; j++) { 
        ctxGame.beginPath();
        let player = gameArray[i][j];
        let color = fillStyles[player]
        let x = cell_width / 2 + i * cell_width;
        let y = cell_width /2 + (j+1) * cell_width;
        ctxGame.fillStyle = color;
        ctxGame.moveTo(x,y);
        ctxGame.arc(x, y, hole_radius, 0, 2 * Math.PI);
        ctxGame.fill();
      }
    }    
  }



  function animateDrop(prevGameArray, player, col, row) {
    const fillStyles = {0: 'lightgrey', 1: 'red', 2: 'yellow'};
    let cell_width = gamePieceCanvas.width / COLS;
    let hole_radius = cell_width * CELL_RADIUS;
    let currentY = cell_width /2;
    let finishY = cell_width /2 + (row +1) * cell_width;
    let posX = cell_width / 2 + col * cell_width
    
    return new Promise(function(resolve,reject) {
      function animate() {
        gameState.animatingDrop = true;
        ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height);
        drawGamePieces(prevGameArray);
        ctxGame.beginPath()
        ctxGame.fillStyle = fillStyles[player];
        ctxGame.moveTo(posX, currentY);
        ctxGame.arc(posX, currentY, hole_radius, 0, 2 * Math.PI);
        ctxGame.closePath();
        ctxGame.fill();
        if (currentY < finishY) {
          if (finishY - currentY < 30) {
            currentY = finishY;
            window.requestAnimationFrame(animate);
          }
          else {
            currentY += 25;
            window.requestAnimationFrame(animate);
          }
        }
        else if (currentY === finishY) {
          setTimeout(resolve, 0);
          gameState.animatingDrop = false;
          //setTimeout moves the resolve to the end ofthe event loop, allowing theanimation to render
          //before starting the AI move
        }

      } 
          
      window.requestAnimationFrame(animate);
   })
  }

  function animateHoverPiece(e, player = PLAYER1) {
    let col = getColumn(e);
    if (typeof prevCol == 'undefined') {
      let prevCol = -1;
    }
    const fillStyles = {0: 'lightgrey', 1: 'red', 2: 'yellow'};
    let cell_width = gamePieceCanvas.width / COLS;
    let hole_radius = cell_width * CELL_RADIUS;
    let posX = cell_width / 2 + col * cell_width
    let posY = cell_width /2;

    if (!gameState.animating) {
      drawGamePieces(gameArray);
      ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height);
      drawGamePieces(gameArray);
      ctxGame.beginPath()
      ctxGame.fillStyle = fillStyles[player];
      ctxGame.moveTo(posX, posY);
      ctxGame.arc(posX, posY, hole_radius, 0, 2 * Math.PI);
      ctxGame.closePath();
      ctxGame.fill();
    }
  }
  
  function handleGameClick(e) {
    if (validMoves && !gameState.winningPlayer && !gameState.animatingDrop) {
      let col = getColumn(e);
      if (gameArray[col].lastIndexOf(0)>= 0) { //if free spot
        makeMove(gameArray, col, PLAYER1, true)
        .then(() => checkWin(gameArray, PLAYER1, col, WINNING_NUMBER))
        .then(() => AImove(gameArray, WINNING_NUMBER))
        
        // draw();
        // current_player = (current_player === PLAYER1 ? PLAYER2 : PLAYER1) //switch current player
      }
    }
  }

  function makeMove(gameArray, col, current_player, animate = false) {
    return new Promise(function(resolve,reject) {

      let row = gameArray[col].lastIndexOf(0); //find last free spot in the array. Returns -1 if no free spots
      function updateBoard() {
        gameArray[col][row] = current_player;
      }
      if (animate) {
        animateDrop(gameArray, current_player, col, row)
        .then(updateBoard)
        .then(resolve);
        
      }
      else { 
        updateBoard() 
        resolve()
      }
    })
  }


  function resetGrid() {
    //Impure fn- effects array, which is not passed
    //reset the game array to be empty (all 0s)
    gameState = {winningPlayer: null, winningPos: []}
    validMoves = true;
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
    let posDiagStart = [tempX, tempY];
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
    let negDiagStart = [tempX, tempY];
    //Iterate over the diagonal through the move point, and append to the check string
    while (tempX < cols && tempY >= 0) {
      negDiagStr += gameArray[tempX][tempY];
      tempX++;
      tempY--;
    }
    //Checks
    if (verticalStr.indexOf(winningStr) >= 0) {
      console.log('win vertical for player', player)
      gameState.winningPos = [moveX, moveY, moveX, moveY + 3];
      gameState.winningPlayer = player;
    }
    if (horizontalStr.indexOf(winningStr) >= 0) {
      console.log('Win horizontal for player', player);
      let stringPos = horizontalStr.indexOf(winningStr);
      gameState.winningPos = [stringPos, moveY, stringPos+3, moveY]
      gameState.winningPlayer = player;
      return true;
    }
    if (posDiagStr.indexOf(winningStr) >= 0) {
      console.log('Win +ve diagonal for player', player);
      let stringPos = posDiagStr.indexOf(winningStr);
      gameState.winningPos = [
        posDiagStart[0]+stringPos, posDiagStart[1] + stringPos,  posDiagStart[0]+stringPos+3, posDiagStart[1] + stringPos+3
      ]
      gameState.winningPlayer = player;
      return true;
    }
    if (negDiagStr.indexOf(winningStr) >= 0) {
      console.log('Win -ve diagonal for player', player);
      let stringPos = negDiagStr.indexOf(winningStr);
      gameState.winningPos = [
        negDiagStart[0]+stringPos, negDiagStart[1] - stringPos,  negDiagStart[0]+stringPos+3, negDiagStart[1] + stringPos - 3
      ]
      gameState.winningPlayer = player;
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
    let rect = gamePieceCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    return Math.floor(x/(gamePieceCanvas.width/COLS));
  }

  function AImove(gameArray, winningScore) {
    let moves = getMoves(gameArray);
    if (typeof moves == 'undefined') {
      // console.log('no moves undef')
    }
    if (moves.length === 1) {
      // console.log('1move')
      makeMove(gameArray, moves[0], PLAYER2, true)
      // draw();
      return checkWin(gameArray, PLAYER2, move[0], winningScore)
    }
    else if (moves.length > 1) {
      // console.log('1+moves', moves)
      let [score, move] = minmax(gameArray, AI_DEPTH, true);
      if (move >=0) {
        console.log(move)
        makeMove(gameArray, move, PLAYER2, true );
        // draw();
        return checkWin(gameArray, PLAYER2, move, winningScore)
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
  
  return {
    resize,
    handleGameClick,
    resetGrid,
    getScore,
    gameArray,
    gameState,
    animateDrop,
    animateHoverPiece,
  }
})();

window.addEventListener('resize', connect4.resize);
window.addEventListener('load', connect4.resize);
document.getElementById('frame-canvas').addEventListener('mousemove', connect4.animateHoverPiece)
document.getElementById('frame-canvas').addEventListener('click', connect4.handleGameClick);
document.getElementById('reset').addEventListener('click', connect4.resetGrid)