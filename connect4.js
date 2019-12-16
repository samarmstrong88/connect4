
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
  let gameState = {
    validMoves: true,
    currentPlayer: PLAYER1,
    winningPlayer: null,
    winningPos: [],
    animatingDrop: false,
    multiPlayer: false, //false to play AI, true to play 2-player
    AIDepth: 1,
    AIMoving: false,
  } 


  const redPiece = new Image();
  redPiece.src = './assets/redpiece.svg';
  
  const yellowPiece = new Image();
  yellowPiece.src = './assets/yellowpiece.svg';


  /*Create an gameArray of columns - each individual array in the game array is one column
  This allows each sub-array to 'fill' during gameplay, rather than filling into different arrays,
  which would occur if the game array was an array of rows. */
  let gameArray = new Array(COLS)
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
  resize();

  function draw() {
    drawFrame();
    drawBackground();
    drawGamePieces(gameArray);
  }


  function resize() {
    //check available height and width of window
    let canvasRect = gamePieceCanvas.getBoundingClientRect();
    let canvasWrapperRect = canvasWrapper.getBoundingClientRect();
    let canvasWrapperMargin = parseInt(window.getComputedStyle(canvasWrapper).getPropertyValue('margin-left'));
        
    let topY = canvasWrapperRect.top;  
    let x = document.body.clientWidth - canvasWrapperMargin * 2;
    let y = window.innerHeight - topY - canvasWrapperMargin * 2;

    if (x>y) {
      backgroundCanvas.width = gamePieceCanvas.width = frameCanvas.width = y
      canvasWrapper.style.height = backgroundCanvas.height = gamePieceCanvas.height = frameCanvas.height = y
      canvasWrapper.style.height = y +'px'
      canvasWrapper.style.width = y +'px'
    }
    else {
      backgroundCanvas.width = gamePieceCanvas.width = frameCanvas.width = x
      backgroundCanvas.height = gamePieceCanvas.height = frameCanvas.height = x
      canvasWrapper.style.width = x +'px'
      canvasWrapper.style.height = x + 'px'
    }

    let gameWrapStyle = window.getComputedStyle(document.getElementById('game-wrapper'));

    let formStyle = window.getComputedStyle(document.querySelector('form'));
    let formWidth = parseInt(formStyle.getPropertyValue('width'));
    let gameWrapperWidth = parseInt(gameWrapStyle.getPropertyValue('width'));
    let gameWrapperHeight = parseInt(gameWrapStyle.getPropertyValue('height'));
    let gameCanvasWidth = canvasWrapperRect.width;
    let gameCanvasHeight = canvasWrapperRect.height;
    const headerTitle = document.getElementById('header-title');


    headerTitle.style.maxWidth = formWidth < gameCanvasWidth * 0.5  ? gameWrapperWidth + 'px' : gameCanvasWidth + 'px';
    
  draw();
  }

  function drawFrame() {
 
    let cell_width = gamePieceCanvas.width / COLS;
    let hole_radius = cell_width * CELL_RADIUS;

    const grad = ctxFrame.createLinearGradient(0,frameCanvas.height/2,frameCanvas.width, frameCanvas.height);
    grad.addColorStop(0, '#0040ff')
    grad.addColorStop(1, '#002db3')
    
    ctxFrame.beginPath();
    ctxFrame.fillStyle = grad;  
    ctxFrame.fillRect(0, cell_width, frameCanvas.width, frameCanvas.height); 
    ctxFrame.save()

    function roundPixels(num) {
      if (num % 1 > 0.75) return Math.ceil(num);
      else if (num % 1) return Math.floor(num);
      else return Math.floor(num) +   0.5;
    }
   
    

     for (let i=0; i< gameArray.length; i++) {
      for (let j=0; j < gameArray[i].length; j++) { 
        let x = cell_width / 2 + i * cell_width;
        let y = cell_width /2 + (j+1) * cell_width;
        ctxFrame.imageSmoothingEnabled = true; 
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
      let xStart = roundPixels(cell_width / 2 + winLine[0] * cell_width);
      let yStart = roundPixels(cell_width / 2 + (winLine[1] +1) * cell_width);
      let xEnd = roundPixels(cell_width / 2 + winLine[2] * cell_width);
      let yEnd = roundPixels(cell_width / 2 + (winLine[3] +1) * cell_width);
      // console.log()

      ctxFrame.moveTo(xStart, yStart)
      ctxFrame.lineTo(xEnd, yEnd);
      ctxFrame.stroke();
    }
    

  }
  function drawBackground() {
    ctxBackground.beginPath();
    ctxBackground.fillStyle = '#c1d4da';
    ctxBackground.fillRect(0,0, backgroundCanvas.width, backgroundCanvas.height);
  }

  function drawGamePieces(gameArray, offsetY = 0) {

    ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height); //clears animation so no double ups
    const pieces = {1: redPiece, 2: yellowPiece};
    let cell_width = gamePieceCanvas.width / COLS;
    let pieceSize = cell_width * CELL_RADIUS *2;
    ctxBackground.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height);

    for (let i=0; i< gameArray.length; i++) {
      for (let j=0; j < gameArray[i].length; j++) { 
        let player = gameArray[i][j];
        if (player > 0) {
          let posX = (cell_width - pieceSize)/2 + i * cell_width;
          let posY = (cell_width - pieceSize)/2 + (j+1+offsetY) * cell_width;
          ctxBackground.drawImage(pieces[player], posX, posY, pieceSize , pieceSize)
        }
      }
    }    
  }

  function animateDrop(prevGameArray, player, col, row) {
    const gamePieces = { 1: redPiece, 2: yellowPiece};
    let cell_width = gamePieceCanvas.width / COLS;
    let pieceSize = cell_width * CELL_RADIUS *2;
    let currentY = (cell_width - pieceSize)/2;
    let finishY = (cell_width - pieceSize)/2 + (row +1) * cell_width;
    let posX = (cell_width - pieceSize)/2 + col * cell_width;

    return new Promise(function(resolve,reject) {
      function animate() {
        gameState.animatingDrop = true;
        ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height)
        ctxGame.drawImage(gamePieces[player], posX, currentY, pieceSize, pieceSize)
        
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
          
          //setTimeout moves the resolve to the end of the event loop, allowing the stack to clear/ animation to render
          //before starting the AI move
        }

      } 
          
      window.requestAnimationFrame(animate);
   })
  }

  
  function animateHoverPiece(e) {
    let col = getColumn(e);
    if (typeof prevCol == 'undefined') {
      let prevCol = -1;
    }
    let player = gameState.currentPlayer;
    const pieces = {1: redPiece, 2: yellowPiece};
    let cell_width = gamePieceCanvas.width / COLS;
    let pieceSize = cell_width * CELL_RADIUS *2;
    let posX = (cell_width - pieceSize)/2 + col * cell_width
    let posY = (cell_width - pieceSize)/2;

    if (!gameState.animating) {
      ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height);
      ctxGame.drawImage(pieces[player], posX, posY, pieceSize , pieceSize);
    }
  }

  function removeHoverPiece() {
    ctxGame.clearRect(0,0, gamePieceCanvas.width, gamePieceCanvas.height);
    // drawGamePieces(gameArray);
  }
  
  function handleGameMove(e) {
    if (gameState.validMoves && !gameState.winningPlayer && !gameState.animatingDrop && !gameState.AIMoving) {
      let col = getColumn(e);
      if (gameArray[col].lastIndexOf(0)>= 0 && !gameState.multiPlayer) { //if free spot
        makeMove(gameArray, col, PLAYER1, true)
        .then(() => drawGamePieces(gameArray))
        .then(() => checkWin(gameArray, PLAYER1, col, WINNING_NUMBER))
        .then(() => AImove(gameArray, WINNING_NUMBER))
      }
      else if (gameArray[col].lastIndexOf(0)>= 0 && gameState.multiPlayer) {
        makeMove(gameArray, col, gameState.currentPlayer, true)
        .then(() => drawGamePieces(gameArray))
        .then(() => checkWin(gameArray, gameState.currentPlayer,col, WINNING_NUMBER))
        .then(() => gameState.currentPlayer = (gameState.currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1)) //switch current player
        draw();
      }
    }
  }

  function makeMove(gameArray, col, currentPlayer, animate = false) {
    return new Promise(function(resolve,reject) {

      let row = gameArray[col].lastIndexOf(0); //find last free spot in the array. Returns -1 if no free spots
      function updateBoard() {
        gameArray[col][row] = currentPlayer;
      }
      if (animate) {
        animateDrop(gameArray, currentPlayer, col, row)
        .then(() => {
          updateBoard();
          resolve();
         })
        
      }
      else { 
        updateBoard() 
        resolve()
      }
    })
  }


  function resetGrid(e) {
    //Impure fn- effects array, which is not passed
    //reset the game array to be empty (all 0s)
    e.preventDefault();
    gameState = {...gameState, winningPlayer: null, winningPos: []}
    Object.assign(gameState, {winningPlayer: null, winningPos: [], validMoves: true});
    draw();
    
    gameState.multiPlayer = document.querySelector('input[name="game-type"]:checked').value == 2;
    gameState.AIDepth = parseInt(document.querySelector('input[name="difficulty-select"]:checked').value);
    
    gameArray = new Array(COLS)
    for (let i = 0; i < COLS; i++) {
      gameArray[i] = new Array(ROWS).fill(0);
    }
    gameState.currentPlayer = PLAYER1;
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
    let moveY = gameArray[col].lastIndexOf(0)+1;
    // console.log(moveX, moveY)

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
      drawFrame();
    }
    if (horizontalStr.indexOf(winningStr) >= 0) {
      console.log('Win horizontal for player', player);
      let stringPos = horizontalStr.indexOf(winningStr);
      gameState.winningPos = [stringPos, moveY, stringPos+3, moveY]
      gameState.winningPlayer = player;
      drawFrame();
    }
    if (posDiagStr.indexOf(winningStr) >= 0) {
      console.log('Win +ve diagonal for player', player);
      let stringPos = posDiagStr.indexOf(winningStr);
      gameState.winningPos = [
        posDiagStart[0]+stringPos, posDiagStart[1] + stringPos,  posDiagStart[0]+stringPos+3, posDiagStart[1] + stringPos+3
      ]
      gameState.winningPlayer = player;
      drawFrame();      
    }
    if (negDiagStr.indexOf(winningStr) >= 0) {
      console.log('Win -ve diagonal for player', player);
      let stringPos = negDiagStr.indexOf(winningStr);
      gameState.winningPos = [
        negDiagStart[0]+stringPos, negDiagStart[1] - stringPos,  negDiagStart[0]+stringPos+3, negDiagStart[1] - stringPos - 3
      ]
      gameState.winningPlayer = player;
      drawFrame();      
    }
  }

  function getMoves(gameArray) {
    let validMovesArr = [];
    for(let i=0; i < gameArray.length; i++) {
      if (gameArray[i][0] == 0) {
        validMovesArr.push(i);
      }
    }
    return validMovesArr;
  }

  function getColumn(e) {
    let rect = gamePieceCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    return Math.floor(x/(gamePieceCanvas.width/COLS));
  }

  async function AImove(gameArray, winningScore) {
    let moves = getMoves(gameArray);
    if (typeof moves == 'undefined') {
    }
    if (moves.length === 1) {
      gameState.AIMoving = true;
      makeMove(gameArray, moves[0], PLAYER2, true)
      .then(() => drawGamePieces(gameArray))
      .then(() => checkWin(gameArray, PLAYER2, moves[0], winningScore));
    }
    else if (moves.length > 1) {
      gameState.AIMoving = true;
      let [score, move] = minmax(gameArray, gameState.AIDepth, true, -1000000000, 1000000000);
      if (move >=0) {
        await makeMove(gameArray, move, PLAYER2, true )
        .then(() => drawGamePieces(gameArray))
        .then(() => checkWin(gameArray, PLAYER2, move, winningScore));
      }
    }
      gameState.AIMoving =false;
  }

  function minmax(gameArray, depth, maxPlayer, alpha, beta) {
    //terminal conditions - if the current board has a win/loss condition, break recursion and return
    //large +ve or -ve result

    let staticScore = getScore(gameArray,4); 
    if (staticScore >= 10000) {//if win/loss condition, stop and return
      return [staticScore -100,-1]
    }
    else if (staticScore <= -10000) { 
      return [staticScore +100,-1]
    }
    //Get array of possible moves (columns with empty spots)
    let moves = getMoves(gameArray);
    let randomMoves = [];
    let movesLength = moves.length;
    for (let i=0; i < movesLength; i++) {
      let randomI = Math.floor(Math.random() * moves.length)
      // console.log(randomI)
      randomMoves.push(moves.splice(randomI, 1)[0]);
    }
    // console.log(randomMoves)

    if (depth === 0 || randomMoves.length === 0) { //no moves left,or terminal condition
      let score = getScore(gameArray, 4);
      return [score, -1]
    }
    //Maximizing player(AI)
    else if (maxPlayer) {
      let bestScore = -1000000000;
      let bestMove;
      

      for (let i=0; i<randomMoves.length; i++) { 
        let move = randomMoves[i]; //for each possible move
        let tempArr = new Array(gameArray.length); //create a temp game array - destroyed after every loop
        for (let i=0; i<gameArray.length; i++) { //copy the game array into temp array
          tempArr[i] = gameArray[i].slice();
        }
        makeMove(tempArr, move, PLAYER2) //make the move on the temp array
        
        let [eva, newMove] = minmax(tempArr, depth -1, false, alpha, beta)
          if (eva > bestScore) {
            bestScore = eva;
            bestMove = move;
          }
          if (alpha < bestScore) {
            alpha = bestScore;
          }
          if ( alpha >= beta) {
            break;
          }
        }
        return [bestScore, bestMove];
      }

      //Minimizing player (simulating player)
    else {
      let bestScore = 1000000000;
      let bestMove;
      for (let i=0; i<randomMoves.length; i++) { 
        let move = randomMoves[i]; //for each possible move
        let tempArr = new Array(gameArray.length); //create a temp game array - destroyed after every loop
        for (let i=0; i<gameArray.length; i++) {
          tempArr[i] = gameArray[i].slice();
        }
        makeMove(tempArr, move, PLAYER1) //make the move on the temp array

        let [eva, newMove] = minmax(tempArr, depth -1, true, alpha, beta)
          if (eva < bestScore) {
            bestScore = eva;
            bestMove = move;
          }
          if (beta > bestScore) {
            beta = bestScore;
          }
          if ( alpha >= beta) {
            break;
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
      let count = [0,0,0]; //[#empty, #player1, #player2]
      let score = 0;
      for (let i=0; i <arr.length; i++){
        count[arr[i]]++; //iterates through the array and adds count to the count array
      }
      if (count[1]===4) {return -10000000} //player win 
      else if (count[1]===3 && count[2]===0) return -1000; //player 3-in-row
      else if (count[1]===2 && count[2]===0) return -10 //player 2-in-row
      else if (count[1]===0 && count[2]===2) return 10; //AI 2-in-row
      else if (count[1]===0 && count[2]===3) return 1000; //AI 3-in-row
      else if (count[2]===4) {
        return 10000000
      } //AI-win
      else return 0; //draw- no 2+s in-a-row, or subarray has both pieces, so can't win for either player
      
    }

    const cols = gameArray.length;
    const rows = gameArray[0].length;

    //vertical

    for (let i=0; i<cols; i++) {
      for (let j =0; j <= rows - winningScore; j++) {
        if (gameArray[i][j+2] > 0) { //j+2 ensures score only checks vertical spots with 2 pieces in the subArr
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
        // console.log([i,j])
        let subArr = new Array(winningScore)
        for (let k=0; k < winningScore; k++) {
          subArr[k] = gameArray[i+k][j+k];
        }
        // console.log(subArr)
        
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
    handleGameMove,
    resetGrid,
    getScore,
    gameArray,
    gameState,
    animateDrop,
    animateHoverPiece,
    removeHoverPiece,
  }
})();

window.addEventListener('resize', connect4.resize);
window.onresize = connect4.resize;
document.getElementById('frame-canvas').addEventListener('mousemove', connect4.animateHoverPiece)
document.getElementById('frame-canvas').addEventListener('click', connect4.handleGameMove);
document.getElementById('frame-canvas').addEventListener('mouseleave', connect4.removeHoverPiece);
document.getElementById('reset').addEventListener('click', connect4.resetGrid)