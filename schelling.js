  // Function to update the value in the span tag for each input range
  function updateRangeValue(rangeId, spanId) {
    const rangeInput = document.getElementById(rangeId);
    const spanElement = document.getElementById(spanId);
    spanElement.textContent = rangeInput.value;
  }

  // Function to shuffle an array randomly (Fisher-Yates shuffle)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Function to generate and populate the grid
  function generateGrid() {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = ''; // Clear the table
  
    const size = parseInt(document.getElementById('size').value, 10);
    const redBluePercentage = parseInt(document.getElementById('red-blue').value, 10);
    const emptyPercentage = parseInt(document.getElementById('empty').value, 10);
  
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
  
    let cellIndex = 0;
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.className = cells[cellIndex];
        cell.id = `cell-${cellIndex}`;
        cellIndex++;
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    }
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

  // Function to perform a single step of the simulation
  function performSimulationStep() {
    // Add your simulation logic here
    // This function should update the grid and set the class 'satisfied' for cells that are satisfied

    // Example (assuming you have a function called 'isSatisfied'):
    // const grid = document.querySelectorAll('table tbody tr td');
    // for (const cell of grid) {
    //   const isCellSatisfied = isSatisfied(cell);
    //   if (isCellSatisfied) {
    //     cell.classList.add('satisfied');
    //   } else {
    //     cell.classList.remove('satisfied');
    //   }
    // }
    
    updateLabels();
  }

  // Event handlers for input changes
  document.getElementById('similar').addEventListener('input', function () {
    updateRangeValue('similar', 'similar-value');
  });

  document.getElementById('red-blue').addEventListener('input', function () {
    updateRangeValue('red-blue', 'red-blue-value');
    generateGrid();
  });

  document.getElementById('empty').addEventListener('input', function () {
    updateRangeValue('empty', 'empty-value');
    generateGrid();
  });

  document.getElementById('size').addEventListener('input', function () {
    updateRangeValue('size', 'size-value');
    generateGrid();
  });

  document.getElementById('reset').addEventListener('click', function () {
    generateGrid();
    updateLabels();
  });

  // The simulation loop
  let currentRound = 0;
  const maxSteps = parseInt(document.getElementById('max-steps').value, 10);
  let simulationInterval;

  function startSimulation() {
    currentRound = 0;
    clearInterval(simulationInterval);
  
    // Get the delay value from the input element
    const delay = parseInt(document.getElementById('delay').value, 10);
  
    simulationInterval = setInterval(function () {
      if (currentRound < maxSteps) {
        performSimulationStep();
        currentRound++;
      } else {
        clearInterval(simulationInterval);
        updateLabels();
      }
    }, delay); // Use the retrieved delay value (in ms)
  }

  document.getElementById('start').addEventListener('click', function () {
    startSimulation();
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
  });

  document.getElementById('stop').addEventListener('click', function () {
    clearInterval(simulationInterval);
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
  });

  document.getElementById('step').addEventListener('click', function () {
    performSimulationStep();
  });

  // Initial setup
  updateRangeValue('similar', 'similar-value');
  updateRangeValue('red-blue', 'red-blue-value');
  updateRangeValue('empty', 'empty-value');
  updateRangeValue('size', 'size-value');
  generateGrid();