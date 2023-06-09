// Set this constant to true to debug the placement of bombs without
// having to click on all cells to reveal them.
const CHEAT_REVEAL_ALL = false;

var defeat = false;
var victory = false;
var clearedCellsCount = 0;

var rowsCount = 10;
var colsCount = 10;
var bombsCount = 15;
var cells;
var timerId;

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  var body = document.getElementsByTagName("body")[0];
  if (victory) {
    victory = false;
    body.classList.remove("victory");
  }

  else if (defeat) {
    defeat = false;
    body.classList.remove("defeat");
  }

  // Get values from form
  const inputRowsCount = parseInt(document.querySelector('#rows').value);
  const inputColsCount = parseInt(document.querySelector('#cols').value);
  const bombsByDifficulty = document.querySelector('#difficulty').value.toLowerCase();

  const modifiers = {
    "easy": 0.125,
    "medium": 0.15,
    "hard": 0.20
  }

  // Validate input and set defaults if necessary
  rowsCount = ((inputRowsCount >= 5) && (inputRowsCount <= 20)) ? inputRowsCount : 10;
  colsCount = ((inputColsCount >= 5) && (inputColsCount <= 20)) ? inputColsCount : 10;
  bombsCount = bombsByDifficulty === "easy" ? Math.round(rowsCount * colsCount * modifiers.easy) :
    bombsByDifficulty === "hard" ? Math.round(rowsCount * colsCount * modifiers.hard) :
                                        /* medium */ Math.round(rowsCount * colsCount * modifiers.medium);

  // Start game with the specified settings
  startGame(rowsCount, colsCount, bombsCount);
});

startGame(rowsCount, colsCount, bombsCount);

function startGame(rows, cols, bombs) {
  rowsCount = rows; 
  colsCount = cols;
  bombsCount = bombs;
  
  // Cell constructor
  class Cell {
    constructor() {
      this.discovered = false;
      this.isBomb = false;
      this.hasBeenFlagged = false;
    }
  }
  
  // Initialize cells
  cells = Array(rowsCount);
  for (var row = 0; row < rowsCount; row++) {
    cells[row] = Array(colsCount);
    for (var col = 0; col < colsCount; col++) {
      cells[row][col] = new Cell();
    }
  }
  
  for (let i = 0; i < bombsCount; i++) {
    // Adding bombs at random positions
    let row = Math.floor(Math.random() * rowsCount);
    let col = Math.floor(Math.random() * colsCount);
    if (cells[row][col].isBomb) {
      i--;
    }
    else {
      cells[row][col].isBomb = true;
    }
  }
  
  // Once the game has been initialized, we "render" it.
  render();
  renderTime();
}
//
// Game functions definitions
//

function discoverCell(row, col) {
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
          if (i >= 0 && i < rowsCount && j >= 0 && j < colsCount && !(i == row && j == col) 
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
      if (i >= 0 && i < rowsCount && j >= 0 && j < colsCount && cells[i][j].isBomb) {
        count++;
      }
    }
  }
  return count;
}

function getBombsCount() {
  var count = 0;
  for (var row = 0; row < rowsCount; row++) {
    for (var col = 0; col < colsCount; col++) {
      if (cells[row][col].hasBeenFlagged) {
        count++;
      }
    }
  }
  return count + "/" + bombsCount;
}

function getClearedCells() {
  var count = 0;
  for (var row = 0; row < rowsCount; row++) {
    for (var col = 0; col < colsCount; col++) {
      if (cells[row][col].discovered) {
        count++;
      }
    }
  }
  return count;
}

function getTotalCellsToClear() {
  return rowsCount * colsCount - bombsCount;
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
    return "Well done! 👏🏼<br><br>Refresh the page or press the button to start again.";
  } else if (defeat) {
    return "Boom! 💥<br><br>Refresh the page or press the button to try again.";
  }
  return "Flag cells holding a \"Shift\" key while clicking the cell";
}

// "Render" the game. Update the content of the page to reflect any changes to the game state.
function render() {
  var playfield = document.getElementById("playfield");
  var html = "";
  for (var row = 0; row < rowsCount; row++) {
    html += '<div class="row">';
    for (var col = 0; col < colsCount; col++) {
      var cell = cells[row][col];
      var cellText = "";
      var cssClass = "";
      var textColor = "";
      if (cell.discovered || CHEAT_REVEAL_ALL || defeat) {
        cssClass = "discovered";
        if (cell.isBomb && !cell.hasBeenFlagged) {
          cellText = "💣";
        } 
        else if (cell.hasBeenFlagged && cell.isBomb) {
          cellText = "🚩";
        } 
        else {
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
function renderTime() {
  clearInterval(timerId);
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

  timerId = setInterval(updateTime, 1000);
}