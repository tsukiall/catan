const createPool = (config) => Object.entries(config).flatMap(([biome, count]) => Array(count).fill(biome));

const boardConfig = {
  4: {
    rows: [3, 4, 5, 4, 3],
    offset: [1, 0.5, 0, 0.5, 1],
    pool: createPool({ lumber: 4, wool: 4, grain: 4, brick: 3, ore: 3, desert: 1 }),
    tokens: [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11],
    harbourTypes: ['any', 'any', 'brick', 'lumber', 'any', 'grain', 'ore', 'any', 'wool'],
    harbourLocations: ['-1-1', '-1-3', '1-4', '3-4', '5-3', '5-1', '4--1', '2--1', '0--1'],
    harbourRotations: ['60deg', '120deg', '180deg', '180deg', '240deg', '300deg', '300deg', '0', '60deg']
  },
  6: {
    rows: [4, 5, 6, 6, 5, 4],
    offset: [1, 0.5, 0, 0.5, 1, 1.5],
    pool: createPool({ lumber: 6, wool: 6, grain: 6, brick: 5, ore: 5, desert: 2 }),
    tokens: [2, 5, 4, 6, 3, 9, 8, 11, 11, 10, 6, 3, 8, 4, 8, 10, 11, 12, 10, 5, 4, 9, 5, 9, 12, 3, 2, 6],
    harbourTypes: ['any', 'any', 'brick', 'wool', 'lumber', 'any', 'grain', 'any', 'ore', 'any', 'wool'],
    harbourLocations: ['-1-1', '-1-4', '1-5', '2-6', '4-5', '6-4', '6-2', '6-1', '5--1', '2--1', '0--1'],
    harbourRotations: ['60deg', '120deg', '180deg', '120deg', '180deg', '240deg', '300deg', '240deg', '300deg', '0', '60deg']
  }
}

const shuffle = (pool) => {
  let currentIndex = pool.length, randomIndex;

  while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [pool[currentIndex], pool[randomIndex]] = [pool[randomIndex], pool[currentIndex]];
  }

  return pool;
}

const getNeighbour = (config, row, col, direction) => {
  let nextRow = row, nextCol = col;

  switch(direction) {
    case 0:
      nextCol = col + 1;
      break;
    case 1:
      nextRow = row + 1;
      nextCol = Math.round(config.offset[row] + col + 0.5 - config.offset[row + 1]);
      break;
    case 2:
      nextRow = row + 1;
      nextCol = Math.round(config.offset[row] + col - 0.5 - config.offset[row + 1]);
      break;
    case 3:
      nextCol = col - 1;
      break;
    case 4:
      nextRow = row - 1;
      nextCol = Math.round(config.offset[row] + col - 0.5 - config.offset[row - 1]);
      break;
    case 5:
      nextRow = row - 1;
      nextCol = Math.round(config.offset[row] + col + 0.5 - config.offset[row - 1]);
      break;
  }

  return { r: nextRow, c: nextCol, key: `${nextRow}-${nextCol}` };
}

const generateTile = (board, type, row, col, offset) => {
  const hex = document.createElement('div');
  hex.classList.add('hex', type);
  hex.style.setProperty('--row', row);
  hex.style.setProperty('--col', col);
  hex.style.setProperty('--row-offset', offset);
  hex.dataset.coords = `${row}-${col}`;

  board.appendChild(hex);
}

const generateTokens = (config) => {
  const unvisited = new Set();
  const coastTiles = [];
  const maxRows = config.rows.length;

  config.rows.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < row; colIndex++) {
      const location = `${rowIndex}-${colIndex}`;
      unvisited.add(location);

      if (rowIndex === 0 || rowIndex === maxRows - 1 || colIndex === 0 || colIndex === row - 1) {
        coastTiles.push({ r: rowIndex, c: colIndex, key: `${rowIndex}-${colIndex}` });
      }
    }
  });

  const startTile = coastTiles[Math.floor(Math.random() * coastTiles.length)];
  const cw = Math.random() > 0.5;

  const isValid = (location) => unvisited.has(location);

  const getDirection = (config, tile) => {
    for (let dir = 0; dir < 6; dir++) {
      const neighbour = getNeighbour(config, tile.r, tile.c, dir);

      if (!isValid(neighbour.key)) {
        continue
      };

      const nextNeighbour = getNeighbour(config, neighbour.r, neighbour.c, cw ? (dir + 5) % 6 : (dir + 1) % 6);

      if (!isValid(nextNeighbour.key)) {
        return dir;
      }
    }
  }

  const path = [];

  let currentTile = startTile;
  let currentDir = getDirection(config, currentTile);

  while (unvisited.size > 0) {
    path.push(currentTile);

    unvisited.delete(currentTile.key);

    if (unvisited.size === 0) break;

    currentDir = cw ? (currentDir + 5) % 6 : (currentDir + 1) % 6;
    let nextTile = getNeighbour(config, currentTile.r, currentTile.c, currentDir);

    while (!isValid(nextTile.key)) {
      currentDir = cw ? (currentDir + 1) % 6 : (currentDir + 5) % 6;
      nextTile = getNeighbour(config, currentTile.r, currentTile.c, currentDir);
    }

    currentTile = nextTile;
  }

  const tokens = [...config.tokens];

  path.forEach((location) => {
    const hex = document.querySelector(`.hex[data-coords="${location.r}-${location.c}"]`);

    if (hex && !hex.classList.contains('desert')) {
      const number = tokens.shift();
      const token = document.createElement('div');
      token.classList.add('token', `num-${number}`);
      token.textContent = number;
      hex.appendChild(token);
    }
  });
}

const generateWater = (board, config, maxRows) => {
  const topOffset = config.offset[0] - 0.5;
  
  for (let col = 0; col <= config.rows[0]; col++) {
    generateTile(board, 'water', -1, col, topOffset);
  }
  
  config.rows.forEach((row, rowIndex) => {
    generateTile(board, 'water', rowIndex, -1, config.offset[rowIndex]);
    generateTile(board, 'water', rowIndex, row, config.offset[rowIndex]);
  });

  const bottomOffset = config.offset[maxRows - 1] - 0.5;

  for (let col = 0; col <= config.rows[maxRows - 1]; col++) {
    generateTile(board, 'water', maxRows, col, bottomOffset);
  }
}

const generateHarbours = (board, config, harbours) => {
  config.harbourLocations.forEach((harbourLocation, index) => {
    const hex = board.querySelector(`.hex[data-coords="${harbourLocation}"]`);

    const harbourTiles = harbours === 'standard' ? [...config.harbourTypes] : shuffle([...config.harbourTypes]);

    const harbourTile = document.createElement('div');
    harbourTile.classList.add('harbour', harbourTiles[index]);
    harbourTile.style.setProperty('transform', `rotate(${config.harbourRotations[index]})`);
    hex.append(harbourTile);
  });
}

const generateBoard = (players, harbours) => {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const config = boardConfig[players];

  const maxRows = config.rows.length;
  const maxCols = Math.max(...config.rows)

  document.documentElement.style.setProperty('--max-rows', maxRows);
  document.documentElement.style.setProperty('--max-cols', maxCols);

  generateWater(board, config, maxRows);

  if (harbours !== 'off') {
    generateHarbours(board, config, harbours);
  }

  const tiles = shuffle([...config.pool]);
  const tokens = [...config.tokens];

  config.rows.forEach((count, rowIndex) => {
    const rowOffset = config.offset[rowIndex];

    for (let colIndex = 0; colIndex < count; colIndex++) {
      const tile = tiles.pop();

      generateTile(board, tile, rowIndex, colIndex, rowOffset);
    }
  });

  generateTokens(config);
}

const form = document.getElementById('settings');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generateBoard(parseInt(form.querySelector('[name=players]').value), form.querySelector('[name=harbours]').value);
});

document.addEventListener('keyup', (e) => {
  switch(e.key) {
    case '2':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-2').forEach((token) => token.classList.add('selected'));
      break;
    case '3':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-3').forEach((token) => token.classList.add('selected'));
      break;
    case '4':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-4').forEach((token) => token.classList.add('selected'));
      break;
    case '5':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-5').forEach((token) => token.classList.add('selected'));
      break;
    case '6':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-6').forEach((token) => token.classList.add('selected'));
      break;
    case '7':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      break;
    case '8':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-8').forEach((token) => token.classList.add('selected'));
      break;
    case '9':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-9').forEach((token) => token.classList.add('selected'));
      break;
    case '0':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-10').forEach((token) => token.classList.add('selected'));
      break;
    case '-':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-11').forEach((token) => token.classList.add('selected'));
      break;
    case '=':
      document.querySelectorAll('.token').forEach((token) => token.classList.remove('selected'));
      document.querySelectorAll('.token.num-12').forEach((token) => token.classList.add('selected'));
      break;
  }
});