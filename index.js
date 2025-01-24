import { resources } from './src/resources.js';
import { Player, Area } from './src/class.js';

const API_URL = 'http://localhost:3000/playerdata';

const game = document.querySelector('.game-container');
game.on = false;

const chat = { open: false };

// canvas and context and screen sizes ------------------------------------------
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.uiElementsWidth = 192;

const screen = { 
  frames: { row: 11, col: 13 }, 
  width: canvas.width - canvas.uiElementsWidth, 
  height: canvas.height 
};

// init assets ------------------------------------------------------------------
const player = new Player();
const area = new Area();
// const uiElements = new UiElements();
// const items = new Items();
// const creatures = new Creatures();

// contains all draw functions --------------------------------------------------
const drawAll = () => {
  // Draw the map (background) and Player
  drawArea();

  // Draw all non-player items like objects or enemies
  // items.forEach(item => item.draw(ctx));

  // Draw UI elements last so they appear on top
  // uiElements.forEach(ui => ui.draw(ctx));
};

// draw player ------------------------------------------------------------------
const playerMove = (e) => {
  if (!game.on || chat.open || player.cooldown) {
    return;
  };

  const down = { x: 0, y: 128 };
  const up = { x: 128, y: 128 };
  const left = { x: 256, y: 128 };
  const right = { x: 384, y: 128 };

  const KEY_W = 'w';
  const KEY_S = 's';
  const KEY_A = 'a';
  const KEY_D = 'd';

  switch (e.key) {
    case KEY_W:
      player.direction = up;
      player.data.details.location.y -= 1;
      break;

    case KEY_S:
      player.direction = down;
      player.data.details.location.y += 1;
      break;

    case KEY_A:
      player.direction = left;
      player.data.details.location.x -= 1;
      break;

    case KEY_D:
      player.direction = right;
      player.data.details.location.x += 1;
      break;

    default:
      return;
  };

  // if (!collisionDetect(dx, dy)) {
  //   updateWorldLocations(valX, valY);
  // };
  
  player.cooldown = true;
  setTimeout(() => {
    player.cooldown = false;
  }, player.speed * 1000);
};

// draw map ---------------------------------------------------------------------
const drawTile = (image, { sx, sy, dx, dy }) => {
  const tileSize = 64; // Fixed size for tiles
  ctx.drawImage(image, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);
};

const drawArea = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
  const upperTileIDs = [220, 222, 223, 224, 240, 243, 260, 262, 263, 280, 283, 300, 301, 302, 303, 304, 320, 321, 322, 323, 324, 340, 343, 360, 362, 363, 380, 383];
  const waterTileIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const boundaries = [];
  const wateries = [];
  const uppermost = [];

  // Calculate starting tile based on the player position
  const startingTile = {
    x: player.data.details.location.x - Math.floor(screen.frames.col / 2),
    y: player.data.details.location.y - Math.floor(screen.frames.row / 2),
  };

  // Generate the visible map
  const visibleMap = currentMap.map(layer => {
    let tiles = [];
    let currentNum = area.mapDimensions.col * (startingTile.y - 1) + startingTile.x;
    for (let i = 0; i < screen.frames.row; i++) {
      tiles.push(...layer.data.slice(currentNum, currentNum + screen.frames.col));
      currentNum += area.mapDimensions.col;
    };
    return tiles;
  });

  // Draw tiles
  visibleMap.forEach(layer => {
    layer.forEach((tileID, i) => {
      if (tileID > 0) {
        const sx = Math.floor((tileID - 1) % 20) * area.pixels; // Source x on spritesheet
        const sy = Math.floor((tileID - 1) / 20) * area.pixels; // Source y on spritesheet
        const dx = Math.floor(i % screen.frames.col) * area.pixels; // Destination x on canvas
        const dy = Math.floor(i / screen.frames.col) * area.pixels; // Destination y on canvas
        const tileData = { sx, sy, dx, dy };
  
        if (tileID === 10 || tileID === 11) {
          boundaries.push(tileData); // use for collision detection
        } else {
          if (waterTileIDs.includes(tileID)) {
            wateries.push(tileData); // potentially alternate tiles to simulate "shimmering"
            drawTile(area.image, tileData);
          } else if (!upperTileIDs.includes(tileID)) {
            drawTile(area.image, tileData);
          };
  
          if (upperTileIDs.includes(tileID)) {
            uppermost.push(tileData);
          };
        };
      };
    });
  });
  
  // Draw player before uppermost layer
  player.draw(ctx);

  // Draw upper tiles after all others
  uppermost.forEach(tileData => {
    drawTile(area.image, tileData);
  });
};

// handle "player login" -------- some day use mongoose -------------------------
const handleLogin = async (e) => {
  e.preventDefault();
  
  const capitalizeWords = input => {  
    return input.split(' ').map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const nameInput = document.querySelector('#playername').value.trim();
  const playerName = capitalizeWords(nameInput);
  player.data = resources.createPlayer(playerName);

  console.log(player)
  setTimeout(() => {
    const form = document.querySelector('.form-container');
    form.style.display = 'none';
    form.blur();
    game.on = true;
    // Start the game loop
    gameLoop();
  }, 500);

};

// update player data -----------------------------------------------------------
const updateLocalPlayerData = () => {
  const playerToUpdateIndex = resources.playerData.playerlist.findIndex(user => user.id === player.data.id);
  if (playerToUpdateIndex !== -1) {
    resources.playerData.playerlist[playerToUpdateIndex] = player.data;
  } else {
    console.warn('New player added.');
    resources.playerData.playerlist.push(player.data);
  };
};

const postPlayerData = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save player data. Server error.');
    };

  } catch(error) {
    console.error('Error saving player data:', error.message);
  };
};

const updateAndPostPlayerData = async () => {
  updateLocalPlayerData();
  await postPlayerData(resources.playerData);
};

// event listeners --------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });

  addEventListener('keydown', playerMove);

  // window.addEventListener('resize', resizeCanvas);

  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });
});

// Game Loop --------------------------------------------------------------------
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic

  // Draw functions
  drawAll();
  // drawAll(ctx, player, map, items, uiElements);

  // Call the next frame
  requestAnimationFrame(gameLoop);
};

/*

Figure out my layers, move player to top layers, and uppermost above that.
Detect collision tiles
Add depots to a depot array
Work on UI section

*/