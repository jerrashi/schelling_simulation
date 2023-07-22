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
    let R = 1; // TODO: Add input field R and get the value of R from the input field
    let simil_threshold = parseInt(document.getElementById('similar').value, 10);
    let occup_threshold = parseInt(document.getElementById('occupancy').value, 10);
  
    const size = gridArray.length;
  
    // Create an array to store unoccupied spots
    let unoccupiedSpots = [];
  
    // NOTE: This is different than the previous implementation of Schelling's simulation since open spots are provided as input.
    // Find and store the unoccupied spots
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (gridArray[i][j] === 'empty') {
          unoccupiedSpots.push({ x: i, y: j });
        }
      }
    }
  
    // Move unsatisfied cells to the closest unoccupied spot that satisfies their thresholds
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cellColor = gridArray[i][j];
        const isCellSatisfied = isSatisfied(gridArray, i, j, R, simil_threshold, occup_threshold);
        if (!isCellSatisfied && cellColor !== 'empty') {
          moveUnsatisfiedCells(gridArray, unoccupiedSpots, i, j, R, simil_threshold, occup_threshold);
        }
      }
    }
  
    // Update the HTML table with the updated gridArray
    console.log('Grid before updating:');
    console.log(gridArray);
    updateGrid();
    console.log('Grid after updating:');
    console.log(gridArray);  
    updateLabels();
  }
  
function isSatisfied(gridArray, i, j, R, simil_threshold, occup_threshold) {
    // This function should return true if the cell at index i, j is satisfied, false otherwise

    const cell = gridArray[i][j];
    const cellColor = cell.className;
    const neighbors = getNeighbors(gridArray, i, j, R);
    const numSimilarNeighbors = getNumSimilarNeighbors(neighbors, cellColor);
    const numOccupiedNeighbors = getNumOccupiedNeighbors(neighbors);
    return numSimilarNeighbors/neighbors.length >= simil_threshold && numOccupiedNeighbors/neighbors.length >= occup_threshold;
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

// Function to move unsatisfied cells to the closest unoccupied spot that satisfies their thresholds
function moveUnsatisfiedCells(gridArray, unoccupiedSpots, i, j, R, simil_threshold, occup_threshold) {
    const size = gridArray.length;
  
    // Create an array to store the distances of unoccupied spots from the unsatisfied cell
    const distances = [];
  
    // Function to calculate the Manhattan distance between two points
    function calculateDistance(x1, y1, x2, y2) {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
  
    // Iterate through the unoccupied spots and calculate distances
    for (const spot of unoccupiedSpots) {
      const dist = calculateDistance(i, j, spot.x, spot.y);
      distances.push({ x: spot.x, y: spot.y, dist });
    }
  
    // Sort the distances array using merge sort
    const sortedDistances = mergeSort(distances);
  
    // Find the closest unoccupied spot that satisfies the thresholds
    for (const { x, y } of sortedDistances) {
      // Move the cell to the target spot
      let originalCell = gridArray[x][y];
      gridArray[x][y] = gridArray[i][j];
      gridArray[i][j] = originalCell;
  
      // Check if the cell is satisfied at the proposed location
      const isSatisfiedProposed = isSatisfied(gridArray, x, y, R, simil_threshold, occup_threshold);
  
      if (isSatisfiedProposed) {
        unoccupiedSpots.push({ x: i, y: j }); // Add the current cell location to unoccupiedSpots
        const indexToRemove = unoccupiedSpots.findIndex(loc => loc.x === x && loc.y === y);
        unoccupiedSpots.splice(indexToRemove, 1); // Remove the target spot from unoccupiedSpots
        break; // Move only once
      } else {
        // Revert the changes if the cell is not satisfied at the proposed location
        gridArray[i][j].className = gridArray[x][y].className;
        gridArray[x][y].className = originalCell;
      }
    }
  }

// Merge sort function to sort the distances array based on distance in ascending order
function mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(mergeSort(left), mergeSort(right));
  }

  function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].dist < right[rightIndex].dist) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
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