// Initial setup - Call generateGrid() on page load
window.addEventListener('load', function () {
    updateRangeValue('similar', 'similar-label');
    updateRangeValue('red-blue', 'red-blue-label');
    updateRangeValue('empty', 'empty-label');
    updateRangeValue('size', 'size-label');
    updateRangeValue('occupancy', 'occupancy-label'); // Added to update the label for occupancy
    generateGrid(); // Added to generate and populate the grid on page load
    updateLabels();
  });
  
  // Define a global variable to store the 2D grid array
  let gridArray = [];
  
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

  // Function to shuffle an array randomly (Fisher-Yates shuffle)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Function to update the value in the span tag for each input range
  function updateRangeValue(rangeId, spanId) {
    const rangeInput = document.getElementById(rangeId);
    const spanElement = document.getElementById(spanId);
    spanElement.textContent = rangeInput.value;
  }
  
  // Function to update the % satisfied and round labels
  function updateLabels() {
    const grid = document.querySelectorAll('table tbody tr td');
    const gridSize = grid.length;
    let numSatisfied = 0;
  
    for (let i = 0; i < gridSize; i++) {
      if (grid[i].classList.contains('satisfied')) {
        numSatisfied++;
      }
    }
  
    const percentSatisfied = ((numSatisfied / gridSize) * 100).toFixed(2);
    document.getElementById('Satisfied').textContent = percentSatisfied;
    document.getElementById('round').textContent = currentRound;
  }
  
// The simulation loop
let currentRound = 0;
let simulationInterval;

function startSimulation() {
    clearInterval(simulationInterval);
  
    // Get the delay value from the input element
    const delay = parseInt(document.getElementById('delay').value, 10);
  
    // Get the maxSteps value from the input element
    const maxSteps = parseInt(document.getElementById('max-steps').value, 10);
  
    // Start the simulation interval
    simulationInterval = setInterval(function () {
      if (currentRound < maxSteps) {
        performSimulationStep();
        currentRound++;
      } else {
        clearInterval(simulationInterval);
        updateLabels();
      }
    }, delay); // Use the retrieved delay value (in ms)
  
    // Update button state
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
  }
  
// Function to update the grid and set the class 'satisfied' for cells that are satisfied
function performSimulationStep() {
    // This updates the gridArray and set the class 'satisfied' for cells that are satisfied
    let R = 1; // TODO: Add input field R and get the value of R from the input field
    let simil_threshold = parseInt(document.getElementById('similar').value, 10);
    let occup_threshold = parseInt(document.getElementById('occupancy').value, 10);
  
    // Create a copy of the gridArray to store the updated values for the next round
    let newGridArray = JSON.parse(JSON.stringify(gridArray));
  
    for (let i = 0; i < gridArray.length; i++) {
      for (let j = 0; j < gridArray[i].length; j++) {
        const cellColor = gridArray[i][j];
        const neighbors = getNeighbors(gridArray, i, j, R);
        const numSimilarNeighbors = getNumSimilarNeighbors(neighbors, cellColor);
        const numOccupiedNeighbors = getNumOccupiedNeighbors(neighbors);
  
        // Check if the cell is satisfied based on the thresholds
        const isCellSatisfied =
          numSimilarNeighbors >= simil_threshold && numOccupiedNeighbors >= occup_threshold;
  
        // Update the newGridArray with the cell's color
        newGridArray[i][j] = cellColor;
  
        // Apply the "satisfied" class to the cell if it is satisfied
        const cellElement = document.getElementById(`cell-${i}-${j}`);
        if (isCellSatisfied) {
          cellElement.classList.add('satisfied');
        } else {
          cellElement.classList.remove('satisfied');
        }
      }
    }
  
    // Update the gridArray with the newGridArray for the next round
    gridArray = newGridArray;
  
    updateLabels();
  }
  
function isSatisfied(gridArray, i, j, R, simil_threshold, occup_threshold) {
    // This function should return true if the cell at index i, j is satisfied, false otherwise

    const cell = gridArray[i][j];
    const cellColor = cell.className;
    const neighbors = getNeighbors(gridArray, i, j, R);
    const numSimilarNeighbors = getNumSimilarNeighbors(neighbors, cellColor);
    const numOccupiedNeighbors = getNumOccupiedNeighbors(neighbors);
    return numSimilarNeighbors >= simil_threshold && numOccupiedNeighbors >= occup_threshold;
  }

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

    function getNumSimilarNeighbors(neighbors, cellColor){
    // This function should return the number of neighbors that are similar to the cell color
    let numSimilarNeighbors = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] === cellColor) {
            numSimilarNeighbors++;
        }
    }
    return numSimilarNeighbors;
    }

    function getNumOccupiedNeighbors(neighbors){
    // This function should return the number of neighbors that are occupied
    let numOccupiedNeighbors = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] !== 'empty') {
            numOccupiedNeighbors++;
        }
    }
    return numOccupiedNeighbors;
    }


document.getElementById('step').addEventListener('click', function () {
    performSimulationStep();
  });
 

function stopSimulation() {
  clearInterval(simulationInterval);
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
}

function updateMaxStepsAndDelay() {
  maxSteps = parseInt(document.getElementById('max-steps').value, 10);
  delay = parseInt(document.getElementById('delay').value, 10);
}

document.getElementById('start').addEventListener('click', function () {
    startSimulation();
  });
  
  document.getElementById('stop').addEventListener('click', function () {
    stopSimulation();
  });
  
  document.getElementById('delay').addEventListener('change', function () {
    updateRangeValue('delay', 'delay-value');
    delay = parseInt(document.getElementById('delay').value, 10); // Update the delay value
  });
  
  document.getElementById('max-steps').addEventListener('change', function () {
    updateRangeValue('max-steps', 'max-steps-value');
    maxSteps = parseInt(document.getElementById('max-steps').value, 10); // Update the maxSteps value
  });