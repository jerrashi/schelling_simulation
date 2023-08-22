// Initial setup - Call generateGrid() on page load
window.addEventListener('load', function () {
  initialize();
});

// Initialize the simulation
function initialize() {
  updateRangeValueLabels();
  generateGrid();
  updateLabels();
}

// Global variables
let gridArray = [];
let currentRound = 0;
let simulationInterval;

// Function to update the value in the span tag for each input range
function updateRangeValueLabels() {
  const rangeIds = ['similar', 'red-blue', 'empty', 'size', 'occupancy', 'delay', 'max-steps'];
  rangeIds.forEach(id => updateRangeValue(id, `${id}-label`));
}

function updateRangeValue(rangeId, spanId) {
  const rangeInput = document.getElementById(rangeId);
  const spanElement = document.getElementById(spanId);
  spanElement.textContent = rangeInput.value;
}

// Function to generate the grid
function generateGrid() {
  const tableBody = document.querySelector('table tbody');
  tableBody.innerHTML = ''; // Clear the table

  const size = parseInt(document.getElementById('size').value, 10);
  const redBluePercentage = parseInt(document.getElementById('red-blue').value, 10);
  const emptyPercentage = parseInt(document.getElementById('empty').value, 10);

  // Calculate the number of cells for each color
  const totalCells = size * size;
  const emptyCells = Math.floor((emptyPercentage / 100) * totalCells);
  const redBlueCells = totalCells - emptyCells;

  const redCells = Math.floor((redBluePercentage / 100) * redBlueCells);
  const blueCells = redBlueCells - redCells;

  const cells = [
    ...Array.from({ length: redCells }, () => 'red'),
    ...Array.from({ length: blueCells }, () => 'blue'),
    ...Array.from({ length: emptyCells }, () => 'empty'),
  ];

  shuffleArray(cells);

  // Clear gridarray and populate with the cell colors
  gridArray = [];
  let cellIndex = 0;
  for (let i = 0; i < size; i++) {
    const rowArray = [];
    const row = document.createElement('tr');
    for (let j = 0; j < size; j++) {
      const cell = document.createElement('td');
      cell.className = cells[cellIndex];
      cell.id = `cell-${i}-${j}`; // Assign unique IDs for each cell
      rowArray.push(cell.className); // Store the color in the 2D array
      cellIndex++;
      row.appendChild(cell);
    }
    gridArray.push(rowArray);
    tableBody.appendChild(row);
  }
}

// Function to update the grid on the webpage without regenerating it
function updateGrid() {
  console.log('Updating grid...');
  console.log(gridArray);
  const tableBody = document.querySelector('table tbody');
  tableBody.innerHTML = ''; // Clear the table
  const size = gridArray.length;

  for (let i = 0; i < size; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < size; j++) {
      const cell = document.createElement('td');
      cell.className = gridArray[i][j];
      cell.id = `cell-${i}-${j}`; // Assign unique IDs for each cell
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }
}

// Function to shuffle an array randomly (Fisher-Yates shuffle)
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Function to update the round label
function updateLabels() {
  document.getElementById('round').textContent = currentRound;
}

// Function to start the simulation
function startSimulation() {
  clearInterval(simulationInterval);
  const delay = parseInt(document.getElementById('delay').value, 10);
  const maxSteps = parseInt(document.getElementById('max-steps').value, 10);
  simulationInterval = setInterval(function () {
    if (currentRound < maxSteps) {
      performSimulationStep();
      currentRound++;
      updateLabels();
    } else {
      stopSimulation();
    }
  }, delay);
  document.getElementById('start').disabled = true;
  document.getElementById('stop').disabled = false;
}

// Function to stop the simulation
function stopSimulation() {
  clearInterval(simulationInterval);
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
}

// Function to perform a simulation step
function performSimulationStep() {
  const R = 1; // Radius
  const simil_threshold = parseInt(document.getElementById('similar').value, 10);
  const occup_threshold = parseInt(document.getElementById('occupancy').value, 10);
  const emptyPercentage = parseInt(document.getElementById('empty').value, 10);

  const size = gridArray.length;
  let unoccupiedSpots = [];
  let numSatisfied = 0; // Added to count the number of satisfied cells
  let noMoreMoves = true; // Added to check if there are no more possible moves


  // Calculate the number of cells for each color
  const totalCells = size * size;
  const emptyCells = Math.floor((emptyPercentage / 100) * totalCells);
  const occupiedCells = totalCells - emptyCells;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (gridArray[i][j] === 'empty') {
        unoccupiedSpots.push({ x: i, y: j });
      }
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cellColor = gridArray[i][j];
      if (cellColor !== 'empty') {
        const isCellSatisfied = isSatisfied(gridArray, i, j, R, simil_threshold, occup_threshold);
        if (isCellSatisfied) {
          numSatisfied++; // Increment the count if the cell is satisfied
        }
        if (!isCellSatisfied) {
          noMoreMoves = false; // If there is at least one unsatisfied cell, set noMoreMoves to false
          moveUnsatisfiedCell(gridArray, unoccupiedSpots, i, j, R, simil_threshold, occup_threshold);
        }
      }
    }
  }

  const percentSatisfied = ((numSatisfied / occupiedCells) * 100).toFixed(2); // Calculate the % satisfied
  document.getElementById('Satisfied').textContent = percentSatisfied; // Update the % satisfied label

  // Stop the simulation if there are no more possible moves
  if (noMoreMoves) {
    clearInterval(simulationInterval);
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
  }

  updateGrid();
}

// Function to check if a cell is satisfied based on its neighbors
function isSatisfied(gridArray, i, j, R, simil_threshold, occup_threshold) {
  const cellColor = gridArray[i][j];
  const neighbors = getNeighbors(gridArray, i, j, R);
  const numSimilarNeighbors = getNumSimilarNeighbors(neighbors, cellColor);
  const numOccupiedNeighbors = getNumOccupiedNeighbors(neighbors);
  const similarityRatio = numSimilarNeighbors / neighbors.length;
  const occupancyRatio = numOccupiedNeighbors / neighbors.length;
  return (similarityRatio >= (simil_threshold / 100)) && (occupancyRatio >= (occup_threshold / 100));
}

// Function to get the neighbors of a cell
function getNeighbors(gridArray, i, j, R) {
  const neighbors = [];
  const size = gridArray.length;
  for (let x = Math.max(0, i - R); x <= Math.min(i + R, size - 1); x++) {
    for (let y = Math.max(0, j - R); y <= Math.min(j + R, size - 1); y++) {
      if (x !== i || y !== j) {
        neighbors.push(gridArray[x][y]);
      }
    }
  }
  return neighbors;
}

// Function to count the number of similar neighbors
function getNumSimilarNeighbors(neighbors, cellColor) {
  return neighbors.filter(neighbor => neighbor === cellColor).length;
}

// Function to count the number of occupied neighbors
function getNumOccupiedNeighbors(neighbors) {
  return neighbors.filter(neighbor => neighbor !== 'empty').length;
}

// Function to move an unsatisfied cell to an unoccupied spot
function moveUnsatisfiedCell(gridArray, unoccupiedSpots, i, j, R, simil_threshold, occup_threshold) {
  const targetSpot = unoccupiedSpots.shift();
  if (targetSpot) {
    const { x, y } = targetSpot;
    [gridArray[i][j], gridArray[x][y]] = [gridArray[x][y], gridArray[i][j]];
    unoccupiedSpots.push({ x: i, y: j });
  }
}

// Event listeners
document.getElementById('start').addEventListener('click', startSimulation);
document.getElementById('stop').addEventListener('click', stopSimulation);

// Event listener for the 'Step' button
document.getElementById('step').addEventListener('click', function () {
  performSimulationStep();
  currentRound++; // Increment the current round
  updateLabels(); // Update the labels
});

// Event listener for the 'Reset' button
document.getElementById('reset').addEventListener('click', function () {
  // Reset the grid array and current round
  gridArray = [];
  currentRound = 0;

  // Generate a new grid
  generateGrid();

  // Update the labels
  updateLabels();

  // Stop any ongoing simulation
  clearInterval(simulationInterval);

  // Enable the 'Start' button and disable the 'Stop' button
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
});