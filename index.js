import { resources } from './src/utils/resources.js';
import { Player, Area, UiElements, Items, Creatures } from './src/utils/classes.js';

const API_URL = 'http://localhost:3000/playerdata';

const game = document.querySelector('.game-container');
game.on = false;

const chat = { open: false };

// canvas and context and screen sizes ------------------------------------------
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
const uiWidth = 192;

const screen = {
  frames: { row: 11, col: 13 }, 
  width: canvas.width - uiWidth, 
  height: canvas.height 
};

// init assets ------------------------------------------------------------------
const player = new Player();
const area = new Area();
const uiElements = new UiElements();
const items = new Items();
const creatures = new Creatures();
// const animations = new Animations();

// character sheet --------------------------------------------------------------
const characterSheet = (player) => {
  const container = document.querySelector(".player-details-container");
  if (!container) return;

  container.innerHTML = `
    <h2>${player.name}</h2>
    <p><strong>level:</strong> ${player.details.lvls.lvl}</p>
    <p><strong>m.level:</strong> ${player.details.lvls.mglvl}</p>
    <br>
    <p><strong>health:</strong> ${player.details.stats.health}</p>
    <p><strong>magic:</strong> ${player.details.stats.magic}</p>
    <p><strong>capacity:</strong> ${player.details.stats.capacity}</p>
    <p><strong>speed:</strong> ${player.details.stats.speed}</p>
    <br>
    <p><strong>fist:</strong> ${player.details.skills.fist}</p>
    <p><strong>sword:</strong> ${player.details.skills.sword}</p>
    <p><strong>axe:</strong> ${player.details.skills.axe}</p>
    <p><strong>blunt:</strong> ${player.details.skills.blunt}</p>
    <p><strong>distance:</strong> ${player.details.skills.distance}</p>
    <p><strong>shield:</strong> ${player.details.skills.shield}</p>
    <p><strong>fishing:</strong> ${player.details.skills.fishing}</p>
  `;
};

// variables --------------------------------------------------------------------
// map variables
let boundaries = [];

// ui variables
let uiState = 'player';
let uiStance = 'passive';

// player variables
let playerState = {};

// contains all draw functions --------------------------------------------------
const drawAll = () => {
  // Populate Character Sheet
  characterSheet(player.data);

  // Draw the map (background) and Player
  drawArea();

  // Draw all non-player items like objects or enemies
  // items.forEach(item => item.draw(ctx));

  // Draw UI elements last so they appear on top
  drawUi();
};

// draw map ---------------------------------------------------------------------
const drawTile = (image, { sx, sy, dx, dy }) => {
  const tileSize = 64; // Fixed size for tiles
  ctx.drawImage(image, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);
};

const drawArea = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
  const upperTileIDs = [220, 222, 223, 224, 240, 243, 260, 262, 263, 280, 283, 300, 301, 302, 303, 304, 320, 321, 322, 323, 324, 340, 343, 360, 362, 363, 380, 383];
  const waterTileIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  boundaries = [];
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
          boundaries.push({ dx, dy }); // use for collision detection
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

// draw ui elements -------------------------------------------------------------
const drawUi = () => {
  const { image, pixels, top, inventory, toggle, stance, state } = uiElements;
  const uiXOffset = screen.width + 4; // Add 4-pixel gap from the screen width
  

  // Clear UI section
  ctx.clearRect(uiXOffset, 0, uiWidth, screen.height);

  // Draw a generic section
  const drawSection = (sprite, location, width, height) => {
    ctx.drawImage(
      image,
      sprite.x,
      sprite.y,
      width || sprite.width,
      height || sprite.height,
      location.x,
      location.y,
      width || sprite.width,
      height || sprite.height
    );
  };

  // Draw toggle bar
  drawSection(toggle.sprite, toggle.location);

  // Draw static UI sections
  drawSection(toggle.sprite, toggle.location); // Map, Inventory, Player toggle bar
  drawSection(inventory.sprite, inventory.location, inventory.location.width, inventory.location.height); // Content area background
  drawSection(stance.sprite, stance.location); // Offense, Defense, Passive buttons

  // Draw current toggle section
  const drawTopSectionAndButton = (section, button, buttonLocation) => {
    drawSection(section, top.location); // Draw top section
    drawSection(button, buttonLocation, pixels, pixels); // Draw active toggle button
  };

  if (uiState === 'map') {
    drawTopSectionAndButton(top.miniMap, toggle.mapButton, toggle.mapButtonLocation);
    // Populate content for map toggle if needed
  } else if (uiState === 'inventory') {
    drawTopSectionAndButton(top.equipArea, toggle.inventoryButton, toggle.inventoryButtonLocation);
    // Populate content for inventory toggle if needed
  } else if (uiState === 'player') {
    drawTopSectionAndButton(top.playerDetails, toggle.playerButton, toggle.playerButtonLocation);
    // Populate content for player toggle if needed
  };

  // Draw current stance
  const drawStance = (stanceType, location) => {
    drawSection(stanceType, location, pixels, pixels);
  };

  if (uiStance === 'offense') {
    drawStance(stance.offense, stance.offenseLocation);
  } else if (uiStance === 'defense') {
    drawStance(stance.defense, stance.defenseLocation);
  } else if (uiStance === 'passive') {
    drawStance(stance.passive, stance.passiveLocation);
  };
};

// handle ui state, toggle buttons and stance -----------------------------------
const handleUiStates = (event) => {
  const { toggle, stance } = uiElements; // Access UI element locations
  const { offsetX, offsetY, type } = event;

  // Helper function to check if the mouse is over a button
  const isMouseOverButton = ({ x, y }, width = 64, height = 64) => {
    return offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height;
  };

  // Generic handler for hover and click events
  const handleInteraction = (buttons, stateUpdater) => {
    for (const [key, button] of Object.entries(buttons)) {
      if (isMouseOverButton(button)) {
        if (type === "mousedown") {
          stateUpdater(key); // Update state variable dynamically
          drawUi();
        };
        return true; // Hovering detected
      };
    };
    return false; // No interaction
  };

  // Process toggle and stance buttons
  const toggleButtons = {
    map: toggle.mapButtonLocation,
    inventory: toggle.inventoryButtonLocation,
    player: toggle.playerButtonLocation,
  };

  const stanceButtons = {
    offense: stance.offenseLocation,
    defense: stance.defenseLocation,
    passive: stance.passiveLocation,
  };

  // Detect hover and update UI state if needed
  const hoveringToggle = handleInteraction(toggleButtons, (key) => (uiState = key));
  const hoveringStance = handleInteraction(stanceButtons, (key) => (uiStance = key));

  // Update cursor style based on hover state
  document.body.style.cursor = hoveringToggle || hoveringStance ? "pointer" : "default";
};

// handle player movement -------------------------------------------------------
const tileSize = 64;
const centerX = 384;
const centerY = 320;

const canMove = (boundaries, newX, newY) => {
  return !boundaries.some(boundary => 
    newX === boundary.dx && newY === boundary.dy
  );
};

const playerMove = (e) => {
  if (!game.on || chat.open || player.cooldown) return;

  const movementOffsets = {
    'w': { x: 0, y: -tileSize },
    's': { x: 0, y: tileSize },
    'a': { x: -tileSize, y: 0 },
    'd': { x: tileSize, y: 0 }
  };

  const directionSprites = {
    'w': { x: 128, y: 128 },
    's': { x: 0, y: 128 },
    'a': { x: 256, y: 128 },
    'd': { x: 384, y: 128 }
  };

  const key = e.key.toLowerCase();
  if (!movementOffsets[key]) return;

  player.direction = directionSprites[key]; // Always update facing direction

  if (e.shiftKey) {
    // If Shift is held, only change direction, do not move
    drawArea();
    return;
  }

  const newX = centerX + movementOffsets[key].x;
  const newY = centerY + movementOffsets[key].y;

  if (canMove(boundaries, newX, newY)) {
    player.data.details.location.x += movementOffsets[key].x / tileSize;
    player.data.details.location.y += movementOffsets[key].y / tileSize;
  }

  drawArea();
  player.cooldown = true;
  setTimeout(() => player.cooldown = false, player.speed * 1000);
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

  setTimeout(() => {
    const form = document.querySelector('.form-container');
    form.style.display = 'none';
    form.blur();
    game.on = true;
    
    // gameLoop();
    drawAll();
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

  canvas.addEventListener("mousemove", handleUiStates);
  canvas.addEventListener("mousedown", handleUiStates);

  // window.addEventListener('resize', resizeCanvas);

  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });
});

// Game Loop --------------------------------------------------------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic

  // Draw functions

  drawAll();


  // Call the next frame
  requestAnimationFrame(gameLoop);
};

/*

Figure out my layers, move player to top layers, and uppermost above that.
Detect collision tiles

Item behavior.... equip section, inventory section

Implement NPCs, behavior
Append map data, player data

*/
