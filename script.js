// Set this constant to true to debug the placement of bombs without
// having to click on all cells to reveal them.
const CHEAT_REVEAL_ALL = false;

// Prompt user for number of rows, columns and bombs
var inputRowsCount = parseInt(prompt("Hello to the Minesweeper game!\nEnter number of rows:", "10"));
var inputColsCount = parseInt(prompt("Enter number of columns:", "10"));
var bombsByDifficulty = prompt("Select game mode (Easy, Medium, Hard):", "Medium").toLowerCase();

const ROWS_COUNT = ((inputRowsCount >= 5) && (inputRowsCount <= 20))? inputRowsCount : 10;
const COLS_COUNT = ((inputColsCount >= 5) && (inputColsCount <= 20))? inputColsCount : 10;
const BOMBS_COUNT = bombsByDifficulty === "easy" ? Math.round(ROWS_COUNT * COLS_COUNT * 0.10) : 
                    bombsByDifficulty === "hard" ? Math.round(ROWS_COUNT * COLS_COUNT * 0.20) : 
                                      /* medium */ Math.round(ROWS_COUNT * COLS_COUNT * 0.15);

var defeat = false;
var victory = false;
var clearedCellsCount = 0;

// Cell constructor
class Cell {
  constructor() {
    this.discovered = false;
    this.isBomb = false;
    this.hasBeenFlagged = false;
  }
}

// Initialize cells
var cells = Array(ROWS_COUNT);
for (var row = 0; row < ROWS_COUNT; row++) {
  cells[row] = Array(COLS_COUNT);
  for (var col = 0; col < COLS_COUNT; col++) {
    cells[row][col] = new Cell();
  }
}

for (let i = 0; i < BOMBS_COUNT; i++) {
  // Adding bombs at random positions
  let row = Math.floor(Math.random() * ROWS_COUNT);
  let col = Math.floor(Math.random() * COLS_COUNT);
  if (cells[row][col].isBomb) {
    i--;
  }
  else {
    cells[row][col].isBomb = true;
  }
}


// Once the game has been initialized, we "render" it.
render();


//
// Game functions definitions
//

function discoverCell(row, col, event) {
  // If the player "discovers" a bomb (clicks on it without holding shift), 
  // set the variable defeat to true. This will be used to display a message to the player.
  if (cells[row][col].isBomb) {
    defeat = true;
    getMessage();
  } else {
    // Reveal cells when clicked.
    cells[row][col].discovered = true;
    clearedCellsCount++;
    if (checkForVictory()) {
      victory = true;
      getMessage();
    }
    // Discover neighbor cells recursively,
    // as long as there are no adjacent bombs to the current cell.
    else if (countAdjacentBombs(row, col) == 0) {
      for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
          if (i >= 0 && i < ROWS_COUNT && j >= 0 && j < COLS_COUNT && !(i == row && j == col) 
          && !cells[i][j].discovered && !cells[i][j].hasBomb) {
            discoverCell(i, j);
          }
        }
      }
    }
  }
}

function flagCell(row, col) {
  cells[row][col].hasBeenFlagged = !cells[row][col].hasBeenFlagged;
  render();
}

// This function is called once for each cell when rendering the game. 
// The row and col of the current cell is passed to the function.
// Adjacent bombs are bombs in cells touching our cell (also diagonally).
function countAdjacentBombs(row, col) {
  var count = 0;
  for (var i = row - 1; i <= row + 1; i++) {
    for (var j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < ROWS_COUNT && j >= 0 && j < COLS_COUNT && cells[i][j].isBomb) {
        count++;
      }
    }
  }
  return count;
}

function getBombsCount() {
  var count = 0;
  for (var row = 0; row < ROWS_COUNT; row++) {
    for (var col = 0; col < COLS_COUNT; col++) {
      if (cells[row][col].hasBeenFlagged) {
        count++;
      }
    }
  }
  return count + "/" + BOMBS_COUNT;
}

function getClearedCells() {
  var count = 0;
  for (var row = 0; row < ROWS_COUNT; row++) {
    for (var col = 0; col < COLS_COUNT; col++) {
      if (cells[row][col].discovered) {
        count++;
      }
    }
  }
  return count;
}

function getTotalCellsToClear() {
  return ROWS_COUNT * COLS_COUNT - BOMBS_COUNT;
}

function checkForVictory() {
  // If the player has revealed as many cells as they must 
  // (every cell that isn't a bomb), set variable victory to true.
  const clearedCells = getClearedCells();
  const totalCellsToClear = getTotalCellsToClear();

  if (clearedCells === totalCellsToClear) {
    return true;
  }

  return false;
}

//
// Rendering functions
//
function getMessage() {
  if (victory == true) {
    return "Well done! 👏🏼<br><br>Refresh the page to start again.";
  } else if (defeat) {
    return "Boom! 💥<br><br>Refresh the page to try again.";
  }
  return "Flag cells holding a \"Shift\" key while clicking the cell";
}

// "Render" the game. Update the content of the page to reflect any changes to the game state.
function render() {
  var playfield = document.getElementById("playfield");
  var html = "";
  for (var row = 0; row < ROWS_COUNT; row++) {
    html += '<div class="row">';
    for (var col = 0; col < COLS_COUNT; col++) {
      var cell = cells[row][col];
      var cellText = "";
      var cssClass = "";
      var textColor = "";
      if (cell.discovered || CHEAT_REVEAL_ALL || defeat) {
        cssClass = "discovered";
        if (cell.isBomb) {
          cellText = "💣";
        } else {
          var adjBombs = countAdjacentBombs(row, col);

          if (adjBombs > 0) {
            cellText = adjBombs.toString();
            // Copilot, refactor the next block to a switchcase:
            switch (adjBombs) {
              case 1: textColor = "blue"; break;
              case 2: textColor = "green"; break;
              case 3: textColor = "red"; break;
              case 4: textColor = "purple"; break;
              case 5: textColor = "maroon"; break;
              case 6: textColor = "turquoise"; break;
              case 7: textColor = "black"; break;
              case 8: textColor = "grey"; break;
            }
          }
        }
      } else {
        if (cell.hasBeenFlagged) {
          cellText = "🚩"
        }
      }
      html += `<div class="cell ${cssClass}" style="color:${textColor}" onclick="onCellClicked(${row}, ${col}, event)">${cellText}</div>`;
    }
    html += "</div>"
  }
  playfield.innerHTML = html;

  // Defeat screen
  var body = document.getElementsByTagName("body")[0];
  if (defeat) {
    body.classList.add("defeat")
  }

  // Victory screen
  if (victory) {
    body.classList.add("victory")
  }

  // Update stats
  document.getElementById("bombs-count").innerText = getBombsCount().toString();
  document.getElementById("cleared-cells-count").innerText = getClearedCells().toString();
  document.getElementById("total-cells-to-clear").innerText = getTotalCellsToClear().toString();

  // Update message
  document.getElementById("message").innerHTML = getMessage();
}

// This function gets called each time a cell is clicked. Arguments "row" and "col" will be set to the relevant
// values. Argument "event" is used to check if the shift key was held during the click.
function onCellClicked(row, col, event) {
  if (event.shiftKey) {
    flagCell(row, col);
  } else {
    discoverCell(row, col, event);
  }
  checkForVictory();
  render();
}

// time rendering
var startTime = new Date();
var currentTime = new Date();

function updateTime() {
  if (victory || defeat) {
    clearInterval(timerId);
  }
  currentTime = new Date();
  var elapsed = currentTime.getTime() - startTime.getTime();
  var elapsedFormatted = new Date(elapsed).toISOString().slice(11, 19);
  
  document.getElementById("time").innerText = elapsedFormatted;
}

var timerId = setInterval(updateTime, 1000);