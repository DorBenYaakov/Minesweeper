"use strict";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function createMat(ROWS, COLS) {
  const mat = [];
  for (var i = 0; i < ROWS; i++) {
    const row = [];
    for (var j = 0; j < COLS; j++) {
      row.push("");
    }
    mat.push(row);
  }
  return mat;
}

function countNegs(board, rowIdx, colIdx) {
  var negMinesCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      var currCell = board[i][j];
      if (currCell.isMine === true) negMinesCount++;
    }
  }
  return negMinesCount;
}

function getNeighbors(board, rowIdx, colIdx) {
  console.log(`Finding neighbors for cell (${rowIdx}, ${colIdx})`);

  const neighbors = [];
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) {
      console.log(`Skipping row ${i} (out of bounds)`);
      continue;
    }

    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) {
        console.log(`Skipping column ${j} (out of bounds)`);
        continue;
      }

      if (i === rowIdx && j === colIdx) {
        console.log(`Skipping cell (${i}, ${j}) (same as input cell)`);
        continue;
      }

      console.log(`Adding neighbor cell (${i}, ${j})`);
      neighbors.push({ i, j });
    }
  }

  console.log("Neighbors found:", neighbors);
  return neighbors;
}
