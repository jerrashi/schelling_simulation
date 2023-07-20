window.onload = function () {
    const stocks = [
        { company: 'Splunk', symbol: 'SPLK', price: 137.55 },
        { company: 'Microsoft', symbol: 'MSFT', price: 232.04 },
        { company: 'Oracle', symbol: 'ORCL', price: 67.08 },
        { company: 'Snowflake', symbol: 'SNOW', price: 235.8 },
        { company: 'Terradata', symbol: 'TDC', price: 44.98 }
    ];

    // Get the table element using the id
    const table = document.getElementById('stocks');

    // Get the tbody element by using the tag name.
    // getElementsByTagName returns a collection, even though the
    // table element has only one tbody element, 
    // Get this tbody element using the index in the array.
    const tbody = table.getElementsByTagName('tbody')[0];

    // Loop through the array of stocks
    for (const stock of stocks) {
        // Create a new row element
        const row = document.createElement('tr');

        // Append the row as the last child of the tbody element
        tbody.appendChild(row);

        // Create td element for stock.company and append to the row element
        row.appendChild(createTd(stock.company));
        // Create td element for stock.symbol and append to the row element
        row.appendChild(createTd(stock.symbol));
        // Create td element for stock.price and append to the row element
        row.appendChild(createTd(stock.price));


        // NOTE: We could have set the HTML of the row to a string that contains the HTML 
        // for a td with date rom this stock as follows:
        // row.innerHTML = `<tr><td>${stock.company}</td><td>${stock.symbol}</td><td>${stock.price}</td></tr>`;
        // However, as stated in the exploration, use of innerHTML can be a security risk.
    };

    /**
     * 
     * @param {string} text 
     * @returns A new td element with the textContent set to the parameter text
     */
    function createTd(text) {
        const td = document.createElement('td');
        td.textContent = text;
        return td;
    }
}

function registerHandlers() {
    function styleAClick(event) {
        event.preventDefault();
        var theme = document.getElementsByTagName('link')[0];
        if (theme.href.includes("styleB.css")){
            theme.href = theme.href.replace("styleB.css", "styleA.css");
        }
    }

    function styleBClick(event) {
        event.preventDefault();
        var theme = document.getElementsByTagName('link')[0];
        if (theme.href.includes("styleA.css")){
            theme.href = theme.href.replace("styleA.css", "styleB.css");
        }
    }

    document.getElementById("styleA").addEventListener("click", styleAClick);
    document.getElementById("styleB").addEventListener("click", styleBClick);
}

document.addEventListener("DOMContentLoaded", registerHandlers);
///////////////////////////////////////////////////////////////////



    // Function to update the value in the span tag for each input range
  function updateRangeValue(rangeId, spanId) {
    const rangeInput = document.getElementById(rangeId);
    const spanElement = document.getElementById(spanId);
    spanElement.textContent = rangeInput.value;
  }

  // Function to generate and populate the grid
  function generateGrid() {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = ''; // Clear the table

    const size = parseInt(document.getElementById('size').value, 10);
    const redBluePercentage = parseInt(document.getElementById('red-blue').value, 10);
    const emptyPercentage = parseInt(document.getElementById('empty').value, 10);

    const totalCells = size * size;
    const redBlueCells = Math.floor((redBluePercentage / 100) * totalCells);
    const emptyCells = Math.floor((emptyPercentage / 100) * totalCells);
    const occupiedCells = totalCells - emptyCells - redBlueCells;

    // Function to generate a random color for cells (red, blue, empty)
    function getRandomColor() {
      const colors = ['red', 'blue', 'empty'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        if (redBlueCells > 0) {
          cell.className = getRandomColor();
          redBlueCells--;
        } else if (emptyCells > 0) {
          cell.className = 'empty';
          emptyCells--;
        } else {
          cell.className = getRandomColor();
        }
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
    generateGrid();
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
    simulationInterval = setInterval(function () {
      if (currentRound < maxSteps) {
        performSimulationStep();
        currentRound++;
      } else {
        clearInterval(simulationInterval);
        updateLabels();
      }
    }, 600); // Set the desired delay here (in ms)
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