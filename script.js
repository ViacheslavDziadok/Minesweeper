
// Set this constant to true to debug the placement of bombs without
// having to click on all cells to reveal them.
const CHEAT_REVEAL_ALL = false;

const ROWS_COUNT = 10;
const COLS_COUNT = 10;
const BOMBS_COUNT = 10;

var defeat = false;
var victory = false;
var clearedCellsCount = 0;

// Cell constructor
function Cell() {
  this.discovered = false;
  this.isBomb = false;
  this.hasBeenFlagged = false;
}

// Initialize cells
var cells = Array(ROWS_COUNT);
for (var row = 0; row < ROWS_COUNT; row++) {
  cells[row] = Array(COLS_COUNT);
  for (var col = 0; col < COLS_COUNT; col++) {
    cells[row][col] = new Cell();
  }
}

//
// TODO: Task 1 - add some bombs at fixed positions.
// cells[2][5].isBomb = true
// cells[4][7].isBomb = true
// cells[3][9].isBomb = true

for (let i = 0; i < BOMBS_COUNT; i++) {
  //
  // TODO: Task 2 - Comment out the code of task 1. Instead of adding bombs in fixed places, add 10 of them in random places.
  //                Add a BOMBS_COUNT constant so that you can easily change the amount of bombs placed. Put it next to the
  //                other constants.
  //
  let row = Math.floor(Math.random() * ROWS_COUNT);
  let col = Math.floor(Math.random() * ROWS_COUNT);
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
  if (cells[row][col].hasBeenFlagged) {
    return;
  }
  //
  // TODO: Task 8 - Implement defeat. If the player "discovers" a bomb (clicks on it without holding shift), set the variable defeat to true.
  //
  if (cells[row][col].isBomb) {
    defeat = true;
    document.body.classList.add("defeat");
    message.innerHTML = "You lost. Click anywhere to start again.";
  } else {
    //
    // TODO: Task 5 - Reveal cells when clicked.
    //
    cells[row][col].discovered = true;
    clearedCellsCount++;
    const cellElement = document.querySelector(`#playfield div:nth-child(${row+1}) div:nth-child(${col+1})`);
    cellElement.classList.add("discovered");
    if (clearedCellsCount == ROWS_COUNT * COLS_COUNT - BOMBS_COUNT) {
      victory = true;
      document.body.classList.add("victory");
      message.innerHTML = "You won! Click anywhere to start again.";
    }
    //
    // TODO: Task 6 - Discover neighbor cells recursively, as long as there are no adjacent bombs to the current cell.
    // 
    else if (countAdjacentBombs(row, col) == 0) {
      for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
          if (i >= 0 && i < ROWS_COUNT && j >= 0 && j < COLS_COUNT && !(i == row && j == col) 
          && !cells[i][j].discovered && !cells[i][j].hasBomb && !cells[i][j].hasBeenFlagged) {
            discoverCell(i, j);
          }
        }
      }
    }
  }
}

function flagCell(row, col) {
  //
  // TODO: Task 7 - Implement flags. Flags allow the player to mark cells that they think contain a bomb.
  //                When clicking a cell and holding shift, function flagCell() will be called for you.
  //
  cells[row][col].hasBeenFlagged = !cells[row][col].hasBeenFlagged;
  render();
}

// This function is called once for each cell when rendering the game. The row and col of the current cell is
// passed to the functionn
function countAdjacentBombs(row, col) {
  //
  // TODO: Task 4 - Adjacent bombs are bombs in cells touching our cell (also diagonally). Implement this function
  //                so that it returns the count of adjacent cells with bombs in them. 
  //
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
  //
  // TODO: Task 9 - Implement stats: the counters currently always display 0, calculate and return the relevant values.
  //function getBombsCount() {
  var count = 0;
  for (var row = 0; row < ROWS_COUNT; row++) {
    for (var col = 0; col < COLS_COUNT; col++) {
      if (cells[row][col].isBomb && !cells[row][col].hasBeenFlagged) {
        count++;
      }
    }
  }
  return count;
}

function getClearedCells() {
  //
  // TODO: Task 9 - Implement stats: the counters currently always display 0, calculate and return the relevant values.
  //
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
  //
  // TODO: Task 9 - Implement stats: the counters currently always display 0, calculate and return the relevant values.
  //
  return ROWS_COUNT * COLS_COUNT - BOMBS_COUNT;
}

function checkForVictory() {
  //
  // TODO: Task 10 - Implement victory. If the player has revealed as many cells as they must (every cell that isn't a
  //                 bomb), set variable victory to true.
  //
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
  return "";
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
            if (adjBombs == 1) {
              textColor = "blue";
            } else if (adjBombs == 2) {
              textColor = "green";
            } else if (adjBombs == 3) {
              textColor = "red";
            } else if (adjBombs == 4) {
              textColor = "black";
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