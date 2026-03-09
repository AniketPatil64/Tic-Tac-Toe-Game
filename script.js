var board;
var playerO = 'O';
var playerX = 'X';
var currPlayer = playerO;
var gameOver = false;
var gameMode = 'manual'; // 'computer' or 'manual'

window.onload = function () {
  setGame();
  setupEventListeners();
};

function setupEventListeners() {
  document
    .getElementById('play-computer-btn')
    .addEventListener('click', () => startGame('computer'));
  document
    .getElementById('play-manual-btn')
    .addEventListener('click', () => startGame('manual'));
  document.getElementById('exit-btn').addEventListener('click', exitGame);
  document
    .getElementById('theme-toggle')
    .addEventListener('click', toggleTheme);
  document
    .getElementById('play-again-btn')
    .addEventListener('click', playAgain);
  document.getElementById('cancel-btn').addEventListener('click', function () {
    $('#winner-modal').modal('hide');
  });
}

function startGame(mode) {
  gameMode = mode;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  resetGame();
}

function exitGame() {
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}

function toggleTheme() {
  const body = document.body;
  const toggleBtn = document.getElementById('theme-toggle');

  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    toggleBtn.innerHTML = 'Dark Mode: ON';
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    toggleBtn.innerHTML = 'Light Mode: ON';
  }
}

function resetGame() {
  board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];
  currPlayer = playerO;
  gameOver = false;

  // Clear the board
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile) => {
    tile.innerText = '';
    tile.classList.remove('winner');
  });

  document.getElementById('Win').textContent = getTurnMessage(currPlayer);
  document.getElementById('Winn').style.display = 'block';
}

function playAgain() {
  $('#winner-modal').modal('hide');
  resetGame();
}

function setGame() {
  board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let tile = document.createElement('div');
      tile.id = r.toString() + '-' + c.toString();
      tile.classList.add('tile');
      if (r == 0 || r == 1) {
        tile.classList.add('horizontal-line');
      }
      if (c == 0 || c == 1) {
        tile.classList.add('vertical-line');
      }
      tile.innerText = '';
      tile.addEventListener('click', setTile);
      document.getElementById('board').appendChild(tile);
    }
  }
}

function setTile() {
  if (gameOver) return;

  // In computer mode, don't allow clicks during computer's turn
  if (gameMode === 'computer' && currPlayer === playerX) return;

  let coords = this.id.split('-');
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);

  if (board[r][c] != ' ') {
    return;
  }

  board[r][c] = currPlayer;
  this.innerText = currPlayer;

  if (checkWinner()) {
    gameOver = true;
    showWinnerModal(currPlayer);
    return;
  }

  // Check for draw
  if (isBoardFull()) {
    gameOver = true;
    showDrawModal();
    return;
  }

  // Switch players
  currPlayer = currPlayer == playerO ? playerX : playerO;

  // If playing against computer and it's computer's turn, make computer move
  if (gameMode === 'computer' && currPlayer === playerX && !gameOver) {
    document.getElementById('Win').textContent = 'Computer is thinking...';
    setTimeout(() => makeComputerMove(), 500); // Delay for better UX
  } else {
    document.getElementById('Win').textContent = getTurnMessage(currPlayer);
  }
}

function checkWinner() {
  // Check rows
  for (let r = 0; r < 3; r++) {
    if (
      board[r][0] == board[r][1] &&
      board[r][1] == board[r][2] &&
      board[r][0] != ' '
    ) {
      for (let i = 0; i < 3; i++) {
        let tile = document.getElementById(r.toString() + '-' + i.toString());
        tile.classList.add('winner');
      }
      return true;
    }
  }

  // Check columns
  for (let c = 0; c < 3; c++) {
    if (
      board[0][c] == board[1][c] &&
      board[1][c] == board[2][c] &&
      board[0][c] != ' '
    ) {
      for (let i = 0; i < 3; i++) {
        let tile = document.getElementById(i.toString() + '-' + c.toString());
        tile.classList.add('winner');
      }
      return true;
    }
  }

  // Check diagonals
  if (
    board[0][0] == board[1][1] &&
    board[1][1] == board[2][2] &&
    board[0][0] != ' '
  ) {
    for (let i = 0; i < 3; i++) {
      let tile = document.getElementById(i.toString() + '-' + i.toString());
      tile.classList.add('winner');
    }
    return true;
  }

  if (
    board[0][2] == board[1][1] &&
    board[1][1] == board[2][0] &&
    board[0][2] != ' '
  ) {
    let tile = document.getElementById('0-2');
    tile.classList.add('winner');
    tile = document.getElementById('1-1');
    tile.classList.add('winner');
    tile = document.getElementById('2-0');
    tile.classList.add('winner');
    return true;
  }

  return false;
}

function showWinnerModal(winner) {
  const winnerText =
    winner === playerX && gameMode === 'computer'
      ? 'Computer'
      : `Player '${winner}'`;
  document.getElementById('winner-message').textContent = `${winnerText} wins!`;
  $('#winner-modal').modal('show');
}

function makeComputerMove() {
  if (gameOver) return;

  const bestMove = getBestMove();
  if (bestMove) {
    const { row, col } = bestMove;
    const tileId = `${row}-${col}`;
    const tile = document.getElementById(tileId);

    board[row][col] = playerX;
    tile.innerText = playerX;

    if (checkWinner()) {
      gameOver = true;
      showWinnerModal(playerX);
      return;
    }

    // Check for draw
    if (isBoardFull()) {
      gameOver = true;
      showDrawModal();
      return;
    }

    // Switch back to human player
    currPlayer = playerO;
    document.getElementById('Win').textContent = getTurnMessage(currPlayer);
  }
}

function getBestMove() {
  // Try to win
  let move = findWinningMove(playerX);
  if (move) return move;

  // Try to block player
  move = findWinningMove(playerO);
  if (move) return move;

  // Take center if available
  if (board[1][1] === ' ') return { row: 1, col: 1 };

  // Take corners
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
  ];
  for (const corner of corners) {
    if (board[corner.row][corner.col] === ' ') return corner;
  }

  // Take any available spot
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === ' ') return { row: r, col: c };
    }
  }

  return null;
}

function findWinningMove(player) {
  // Check all possible moves for a winning position
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === ' ') {
        board[r][c] = player;
        if (checkWinnerForPlayer(player)) {
          board[r][c] = ' '; // Reset
          return { row: r, col: c };
        }
        board[r][c] = ' '; // Reset
      }
    }
  }
  return null;
}

function checkWinnerForPlayer(player) {
  // Check rows
  for (let r = 0; r < 3; r++) {
    if (
      board[r][0] === player &&
      board[r][1] === player &&
      board[r][2] === player
    ) {
      return true;
    }
  }

  // Check columns
  for (let c = 0; c < 3; c++) {
    if (
      board[0][c] === player &&
      board[1][c] === player &&
      board[2][c] === player
    ) {
      return true;
    }
  }

  // Check diagonals
  if (
    board[0][0] === player &&
    board[1][1] === player &&
    board[2][2] === player
  ) {
    return true;
  }
  if (
    board[0][2] === player &&
    board[1][1] === player &&
    board[2][0] === player
  ) {
    return true;
  }

  return false;
}

function getTurnMessage(player) {
  if (gameMode === 'computer') {
    return player === playerO ? 'Your turn (O)' : "Computer's turn (X)";
  } else {
    return `Turn of '${player}' Player!`;
  }
}

function showDrawModal() {
  document.getElementById('winner-message').textContent = "It's a draw!";
  $('#winner-modal').modal('show');
}

function isBoardFull() {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === ' ') return false;
    }
  }
  return true;
}
