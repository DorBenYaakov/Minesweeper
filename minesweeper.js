"use strict";

// Global variables
const FLAG = "🚩";
const MINE = '<img src="mine.png" class="mine-img" alt="Mine">';

var lives = 1; // Remaining player lives
var gBoard = []; // Current game board
var gLevels = [
  // Difficulty levels
  { difficulty: "Beginner", SIZE: 4, MINES: 2, lives: 1 },
  { difficulty: "Medium", SIZE: 8, MINES: 14, lives: 2 },
  { difficulty: "Expert", SIZE: 12, MINES: 32, lives: 3 },
];
var gCurrentLevel = gLevels[0]; // Default difficulty level
var gTimerInterval; // Interval variable for the game timer

// Game state object
var gGame = {
  isOn: false, // Indicates if the game is active
  shownCount: 0, // Number of revealed cells
  markedCount: 0, // Number of marked cells
  secsPassed: 0, // Timer count in seconds
  isFirstClick: true, // Tracks if the first click has been made
};

// Called when the page loads or game is restarted
function onInit() {
  gGame.isOn = true;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gGame.isFirstClick = true; // Reset first click flag

  lives = gCurrentLevel.lives;
  updateRestartButton(); // Update the restart button emoji
  const livesElement = document.getElementById("lives");
  livesElement.innerText = "❤".repeat(lives);
  gBoard = buildBoard(); // Build a new empty board
  renderBoard(gBoard); // Render the board in the UI
  // Timer reset
  clearInterval(gTimerInterval);
  gGame.secsPassed = 0;
  document.querySelector("#game-timer").innerText = `Time elapsed: 0`;
}

// Checks if any cell has been revealed
function firstClick() {
  let isRevealed = false;
  for (var i = 0; i < gCurrentLevel.SIZE; i++) {
    for (var j = 0; j < gCurrentLevel.SIZE; j++) {
      if (gBoard[i][j].isShown) {
        isRevealed = true;
      }
    }
  }
  return isRevealed;
}

// Updates the game timer on the screen every second
function updateTimer() {
  gGame.secsPassed++;
  document.querySelector(
    "#game-timer"
  ).innerHTML = `Time elapsed: ${gGame.secsPassed}`;
}

// Creates an empty game board based on the current level's size
function buildBoard() {
  const SIZE = gCurrentLevel.SIZE;
  var board = [];
  for (var i = 0; i < SIZE; i++) {
    var row = [];
    for (var j = 0; j < SIZE; j++) {
      row.push({
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      });
    }
    board.push(row);
  }
  return board;
}

// Randomly places mines on the board, avoiding the first clicked cell
function setMines(board, firstI, firstJ) {
  const excludedCells = getNeighbors(board, firstI, firstJ);
  excludedCells.push({ i: firstI, j: firstJ });

  // console.log("Excluded cells:", excludedCells);

  let minesPlaced = 0;
  while (minesPlaced < gCurrentLevel.MINES) {
    let i = getRandomInt(0, gCurrentLevel.SIZE - 1);
    let j = getRandomInt(0, gCurrentLevel.SIZE - 1);

    // console.log(`Attempting to place mine at [${i}, ${j}]`);

    let isExcluded = false;
    for (let k = 0; k < excludedCells.length; k++) {
      let cell = excludedCells[k];
      if (cell.i === i && cell.j === j) {
        // console.log(`Cell [${i}, ${j}] is excluded`);
        isExcluded = true;
        break;
      }
    }

    if (board[i][j].isMine || isExcluded) continue;

    board[i][j].isMine = true;
    minesPlaced++;
    // console.log(`Mine placed at [${i}, ${j}]. Total mines: ${minesPlaced}`);
  }
}

// Calculates and sets the number of mines around each cell
function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var negMinesCount = countNegs(board, i, j);
      board[i][j].minesAroundCount = negMinesCount;
    }
  }
}

// Renders the game board on the page
function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < board[i].length; j++) {
      const tdId = `cell-${i}-${j}`;
      strHTML += `
        <td id="${tdId}" 
            onclick="onCellClicked(this, ${i}, ${j})" 
            oncontextmenu="event.preventDefault(); onCellMarked(this, ${i}, ${j});">
        </td>`;
    }
    strHTML += "</tr>";
  }
  document.querySelector("#game-board table").innerHTML = strHTML;
}

// Changes the difficulty level and restarts the game
function setDifficulty(levelIndex) {
  clearInterval(gTimerInterval);
  gCurrentLevel = gLevels[levelIndex];
  lives = gCurrentLevel.lives;
  // console.log("Lives set to:", lives);
  onInit();
}

// Handles left-click on a cell
function onCellClicked(elCell, i, j) {
  if (gGame.isFirstClick) {
    gTimerInterval = setInterval(updateTimer, 1000);
    setMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
    gGame.isFirstClick = false;
    // console.log(`First click at cell [${i}, ${j}]. Mines set.`);
  }

  if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

  if (gBoard[i][j].isMine) {
    gBoard[i][j].isShown = true;
    gGame.shownCount++; // Increment shown count for mine
    // console.log(`Mine clicked at cell [${i}, ${j}]. Shown count: ${gGame.shownCount}`);

    elCell.insertAdjacentHTML("beforeend", MINE);
    elCell.classList.add("revealed");

    // Flash the mine and hide it again if there are remaining lives
    setTimeout(() => {
      if (lives > 0) {
        elCell.classList.remove("revealed");
        elCell.innerHTML = "";
        gBoard[i][j].isShown = false;
        gGame.shownCount--; // Decrement shown count if hidden again
        // console.log(`Mine at cell [${i}, ${j}] hidden again. Shown count: ${gGame.shownCount}`);
      }
    }, 600);

    lives--;
    const livesElement = document.getElementById("lives");
    livesElement.innerText = livesElement.innerText.slice(0, -1);

    if (lives === 0) gameOver();
  } else {
    if (!gBoard[i][j].isShown) {
      gBoard[i][j].isShown = true;
      gGame.shownCount++; // Increment shown count for non-mine

      if (gBoard[i][j].minesAroundCount > 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        elCell.classList.add("revealed");
      } else {
        expandShown(gBoard, i, j);
      }

      // Check for victory condition after cell is revealed and processed
      isVictory();
    }
  }
}

// Handles right-click on a cell to mark/unmark it
function onCellMarked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isShown) return;

  // Toggle mark
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked;

  if (gBoard[i][j].isMarked) {
    gGame.markedCount++; // Increment marked count
    // console.log(`Cell [${i}, ${j}] marked. Total marked: ${gGame.markedCount}`);
  } else {
    gGame.markedCount--; // Decrement marked count
    // console.log(`Cell [${i}, ${j}] unmarked. Total marked: ${gGame.markedCount}`);
  }

  // Update cell display
  elCell.innerHTML = gBoard[i][j].isMarked ? FLAG : "";

  // Only check victory after finishing display update and count changes
  if (gGame.isMarked || gGame.shownCount) isVictory();
}

// Expands the shown area when clicking on a zero-cell
function expandShown(board, i, j) {
  updateNegs(board, i, j);
}

// Reveals all mines on the board when the game is over
function exposeMines(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j].isMine) {
        if (!board[i][j].isShown) {
          gBoard[i][j].isShown = true;
          gGame.shownCount++; // Increment shown count for mines
        }
        document.getElementById(`cell-${i}-${j}`).innerHTML = MINE;
      }
    }
  }
}

// Updates the restart button emoji based on the game state
function updateRestartButton(victory = false) {
  if (lives === 0) {
    document.getElementById("restartButton").innerHTML = "🤯";
  } else if (victory) {
    document.getElementById("restartButton").innerHTML = "😎";
  } else {
    document.getElementById("restartButton").innerHTML = "😁";
  }
}

// Ends the game when lives reach zero
function gameOver() {
  if (lives === 0 || isVictory()) {
    exposeMines(gBoard);
    updateRestartButton();
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    // console.log("Game over.");
  }
}

// Updates neighboring cells when a zero-cell is revealed
function updateNegs(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length || (i === rowIdx && j === colIdx))
        continue;

      var currCell = board[i][j];

      if (currCell.isShown) continue;

      currCell.isShown = true;
      gGame.shownCount++;
      // console.log("Neighbor cell shown. shownCount:", gGame.shownCount);

      if (currCell.minesAroundCount > 0 && !currCell.isMine) {
        var elCell = document.getElementById(`cell-${i}-${j}`);
        elCell.innerHTML = currCell.minesAroundCount;
        elCell.classList.add("revealed");
      } else {
        expandShown(board, i, j);
      }
    }
  }
}

function isVictory() {
  const allCellsRevealed =
    gGame.shownCount === gCurrentLevel.SIZE ** 2 - gCurrentLevel.MINES;
  const allMinesMarked = gGame.markedCount === gCurrentLevel.MINES;

  if (allCellsRevealed && allMinesMarked) {
    // console.log("Game won!");
    gGame.isOn = false; // Stop further game actions
    updateRestartButton(true); // Update button here directly
    clearInterval(gTimerInterval);
    return true;
  }

  return false;
}
