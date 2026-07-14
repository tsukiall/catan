const createPool = (config) => Object.entries(config).flatMap(([biome, count]) => Array(count).fill(biome));

const boardConfig = {
  4: {
    rows: [3, 4, 5, 4, 3],
    offset: [1, 0.5, 0, 0.5, 1],
    pool: createPool({ lumber: 4, wool: 4, grain: 4, brick: 3, ore: 3, desert: 1 }),
    tokens: [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
    harbours: [
      {
        location: '0-1',
        type: '3:1',
        rotation: '-30deg'
      },
      {
        location: '0-2',
        type: '3:1',
        rotation: '30deg'
      },
      {
        location: '1-3',
        type: 'Brick',
        rotation: '90deg'
      },
      {
        location: '3-3',
        type: 'Lumber',
        rotation: '90deg'
      },
      {
        location: '4-2',
        type: '3:1',
        rotation: '150deg'
      },
      {
        location: '4-1',
        type: 'Grain',
        rotation: '-150deg'
      },
      {
        location: '3-0',
        type: 'Ore',
        rotation: '-150deg'
      },
      {
        location: '2-0',
        type: '3:1',
        rotation: '-90deg'
      },
      {
        location: '1-0',
        type: 'Wool',
        rotation: '-30deg'
      },
    ]
  },
  6: {
    rows: [4, 5, 6, 6, 5, 4],
    offset: [1, 0.5, 0, 0.5, 1, 1.5],
    pool: createPool({ lumber: 6, wool: 6, grain: 6, brick: 5, ore: 5, desert: 2 }),
    tokens: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
    harbours: [
      {
        location: '0-1',
        type: '3:1',
        rotation: '-30deg'
      },
      {
        location: '0-3',
        type: '3:1',
        rotation: '30deg'
      },
      {
        location: '1-4',
        type: 'Brick',
        rotation: '90deg'
      },
      {
        location: '3-5',
        type: '3:1',
        rotation: '30deg'
      },
      {
        location: '4-4',
        type: 'Wood',
        rotation: '90deg'
      },
      {
        location: '5-3',
        type: '3:1',
        rotation: '150deg'
      },
      {
        location: '5-2',
        type: 'Grain',
        rotation: '-150deg'
      },
      {
        location: '5-0',
        type: 'Wool',
        rotation: '150deg'
      },
      {
        location: '4-0',
        type: 'Ore',
        rotation: '-150deg'
      },
      {
        location: '2-0',
        type: '3:1',
        rotation: '-90deg'
      },
      {
        location: '1-0',
        type: 'Wool',
        rotation: '-30deg'
      },
    ]
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

const generateBoard = (players, harbours) => {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const config = boardConfig[players];

  const maxRows = config.rows.length;
  const maxCols = Math.max(...config.rows)

  document.documentElement.style.setProperty('--max-rows', maxRows);
  document.documentElement.style.setProperty('--max-cols', maxCols);

  const tiles = shuffle([...config.pool]);
  const tokens = shuffle([...config.tokens]);

  config.rows.forEach((count, rowIndex) => {
    const rowOffset = config.offset[rowIndex];

    for (let colIndex = 0; colIndex < count; colIndex++) {
      const tile = tiles.pop();

      const hex = document.createElement('div');
      hex.classList.add('hex', tile);
      hex.style.setProperty('--row', rowIndex);
      hex.style.setProperty('--col', colIndex);
      hex.style.setProperty('--row-offset', rowOffset);

      board.appendChild(hex);

      if (tile !== 'desert') {
        const token = tokens.pop();

        const number = document.createElement('div');
        number.classList.add('token', `num-${token}`);
        number.textContent = token;

        hex.appendChild(number);
      }

      const harbourConfig = config.harbours.find((h) => h.location === `${rowIndex}-${colIndex}`)

      if (harbours && harbourConfig) {
        const harbour = document.createElement('div');

        harbour.classList.add('harbour');
        harbour.style.setProperty('--row', rowIndex);
        harbour.style.setProperty('--col', colIndex);
        harbour.style.setProperty('--row-offset', rowOffset);
        harbour.style.setProperty('top', (hex.offsetTop + hex.clientHeight / 2) - hex.clientHeight / 4);
        harbour.style.setProperty('left', (hex.offsetLeft + hex.clientWidth / 2) - hex.clientHeight / 4);
        harbour.style.setProperty('transform', `rotate(${harbourConfig.rotation}) translateY(-${hex.clientHeight / 4 + hex.clientWidth / 2}px)`);
        harbour.textContent = harbourConfig.type;

        board.appendChild(harbour);
      }
    }
  });
}

const form = document.getElementById('settings');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generateBoard(parseInt(form.querySelector('[name=players]').value), form.querySelector('[name=harbours]').checked);
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