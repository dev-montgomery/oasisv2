import { resources } from './src/utils/resources.js';
import { Player, Area, UiElements, Items, Item, Creatures } from './src/utils/classes.js';
import { characterSheet } from './src/components/stats.js';
import { generateHexId, getMousePosition } from './src/utils/utils.js';
import { 
  API_URL_PLAYER, 
  API_URL_ITEMS, 
  canvas, 
  ctx, 
  renderArea, 
  game, 
  chat, 
  tileSize, 
  centerX, 
  centerY, 
  waterTileIDs, 
  uppermostTileIDs,
  equipSlots, 
  equipSlotSize, 
  inventorySlots, 
  inventorySlotSize
} from './src/components/const.js';

// init sprite assets ------------------------------------------------------------------
const player = new Player();
const area = new Area();
const uiElements = new UiElements();
const items = new Items();
const creatures = new Creatures();
// const animations = new Animations();

// movement variables
let lastMouseX = 0;
let lastMouseY = 0;

// map variables
let boundaryTiles = [];
let waterTiles = [];
let uppermostTiles = [];

// ui variables
let uiState = 'player';
let uiStance = 'passive';

// item variables
let inGameItems = [];

// contains all draw functions --------------------------------------------------
const drawAll = () => {
  // Populate Character Sheet
  characterSheet(player.data);

  // Draw the map (background) and Player
  drawArea();

  // Draw UI elements last so they appear on top
  drawUi();

  // Draw all non-player items like objects or enemies
  inGameItems.forEach(item => isItemInRenderArea(item) && drawItem(item));
  
  // Draw player before uppermost layer
  player.draw(ctx);

  // Draw upper tiles after all others
  uppermostTiles.forEach(tileData => drawTile(area.image, tileData));
};

// draw renderArea ------------------------------------------------------------------
const drawTile = (image, { sx, sy, dx, dy }) => {
  const tileSize = 64; // Fixed size for tiles
  ctx.drawImage(image, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);
};

const drawArea = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
  boundaryTiles = [];
  waterTiles = [];
  uppermostTiles = [];

  // Calculate starting tile based on the player position
  const startingTile = {
    x: player.data.details.location.x - Math.floor(renderArea.size.col / 2),
    y: player.data.details.location.y - Math.floor(renderArea.size.row / 2),
  };

  // Generate the visible map
  const visibleMap = currentMap.map(layer => {
    let tiles = [];
    let currentNum = area.mapDimensions.col * (startingTile.y - 1) + startingTile.x;
    for (let i = 0; i < renderArea.size.row; i++) {
      tiles.push(...layer.data.slice(currentNum, currentNum + renderArea.size.col));
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
        const dx = Math.floor(i % renderArea.size.col) * area.pixels; // Destination x on canvas
        const dy = Math.floor(i / renderArea.size.col) * area.pixels; // Destination y on canvas
        const tileData = { sx, sy, dx, dy };
  
        if (tileID === 10 || tileID === 11) {
          boundaryTiles.push({ dx, dy }); // Collision detection
        } else if (uppermostTileIDs.includes(tileID - 1)) {
          uppermostTiles.push(tileData);
        } else {
          drawTile(area.image, tileData);
          if (waterTileIDs.includes(tileID - 1)) {
            waterTiles.push(tileData);
          };
        };
      };
    });
  });
};

// draw ui elements -------------------------------------------------------------
const drawUi = () => {
  const { image, pixels, top, inventory, toggle, stance, state } = uiElements;
  const uiXOffset = renderArea.width + 4; // Add 4-pixel gap from the renderArea width
  
  // Clear UI section
  ctx.clearRect(uiXOffset, 0, canvas.uiWidth, renderArea.height);

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

  uiState === "inventory" && inGameItems.forEach(item => item.category === "equipped" && drawItem(item));
};

const handleUiStates = (e) => {
  const { toggle, stance } = uiElements;
  const { offsetX, offsetY, type } = e;

  const isMouseOverButton = ({ x, y }, width = 64, height = 64) => {
    return offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height;
  };

  const handleInteraction = (buttons, stateUpdater) => {
    for (const [key, button] of Object.entries(buttons)) {
      if (isMouseOverButton(button)) {
        if (type === "mousedown") {
          stateUpdater(key);
          drawUi();
        };
        return "pointer"; // Return pointer if over a UI element
      };
    };
    return null; // Return null if no UI interaction
  };

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

  return (
    handleInteraction(toggleButtons, (key) => (uiState = key)) ||
    handleInteraction(stanceButtons, (key) => (uiStance = key))
  );
};

// handle item behavior ---------------------------------------------------------
const createNewItem = (name, location, coordinates = null) => {
  const baseItem = resources.itemData.items.find(it => it.name === name);
  if (!baseItem) {
    console.error(`Item "${name}" not found in itemData.`);
    return null;
  };

  // Create a deep copy of the item to prevent modifying the original
  const newItem = {
    ...baseItem,
    id: generateHexId(),
    category: location, // world, inventory, npc-corpse, etc.
    worldPosition: location === "world" ? coordinates : null, // Only for world items
    // drawPosition: destination, // renderArea draw position (if needed)
  };

  inGameItems.push(newItem);
  return newItem;
};

const drawItem = (item) => {
  if (item.worldPosition) updateItemDrawPosition(item);

  const { spritePosition, drawPosition } = item;
  const size = 64;

  ctx.drawImage(
    items.image,
    spritePosition.x,
    spritePosition.y,
    size,
    size,
    drawPosition.x,
    drawPosition.y,
    size,
    size
  );
};

const isItemInRenderArea = (item) => {
  const inRenderArea = (
    item.worldPosition !== null &&
    item.worldPosition.x >= 0 &&
    item.worldPosition.x < renderArea.width &&
    item.worldPosition.y >= 0 &&
    item.worldPosition.y < renderArea.height
  );

  // const inEquipSlot = Object.values(equipSlots).some(({ x, y }) =>
  //   item.drawPosition.x === x + renderArea.width && item.drawPosition.y === y
  // );

  // const inInventorySlot = Object.values(inventorySlots).some(({ x, y }) =>
  //   item.drawPosition.x === x + renderArea.width && item.drawPosition.y === y
  // );

  return inRenderArea;
};

const isItemInRangeOfPlayer = (item) => {
  const playerFrameX = player.data.details.location.x;
  const playerFrameY = player.data.details.location.y;

  const dx = item.worldPosition && Math.abs(item.worldPosition.x - playerFrameX);
  const dy = item.worldPosition && Math.abs(item.worldPosition.y - playerFrameY);
  
  return dx <= 1 && dy <= 1; // Ensures the item is in the player's frame or an adjacent frame
};

const updateItemDrawPosition = (item) => {
  const { x: playerX, y: playerY } = player.data.details.location;
  const { col, row } = renderArea.size;

  const visibleStartX = playerX - Math.floor(col / 2);
  const visibleStartY = playerY - Math.floor(row / 2);

  const newX = (item.worldPosition.x - visibleStartX) * 64;
  const newY = (item.worldPosition.y - visibleStartY) * 64;
  
  Object.assign(item.drawPosition, { x: newX, y: newY });
};

const populateInGameItems = () => {
  if (!Array.isArray(resources.itemData.itemsInGame)) {
    console.error("Error: itemsInGame is not an array.");
    return;
  };

  inGameItems = resources.itemData.itemsInGame.map(item => ({
    ...item, // Copy existing item properties
    id: item.id || generateHexId(), // Ensure each item has a unique ID
  }));
};

// Equip item if valid
const moveToEquip = (item, slot) => {
  if (item.type !== slot) return; // Prevent equipping wrong type
  // Update player data
  player.data.details.equipped[slot] = item.id;

  // Update item properties
  item.category = "equipped";
  item.worldPosition = null; // No longer in the game world
  item.drawPosition.x = equipSlots[slot].x;
  item.drawPosition.y = equipSlots[slot].y;

  console.log(`Equipped ${item.name} in ${slot} slot.`)
  drawAll();
};

// Unequip item and return to world
const unequipItem = (item) => {
  const equippedSlot = Object.keys(player.data.details.equipped).find(
    slot => player.data.details.equipped[slot] === item.id
  );

  if (!equippedSlot) return; // Item wasn't equipped

  // Remove from equipped data
  player.data.details.equipped[equippedSlot] = "empty";
  console.log(`Unequipped ${item.name} from ${equippedSlot} slot.`);

  // Restore item properties
  item.category = "world";
};

const getEquipSlotUnderCursor = (e) => {
  if (uiState !== "inventory") return null;

  const mouseX = e.clientX - canvas.offsetLeft;
  const mouseY = e.clientY - canvas.offsetTop;

  return Object.entries(equipSlots).find(([_, { x, y }]) =>
    mouseX >= x && mouseX <= x + 64 &&
    mouseY >= y && mouseY <= y + 64
  )?.[0] || null; // Returns slot name or null
};

const getInventorySlotUnderCursor = (e) => {

};

// mouse behavior ---------------------------------------------------------------
const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;

  // Check UI first and update cursor accordingly
  const uiCursor = handleUiStates(e);
  if (uiCursor) {
    canvas.style.cursor = uiCursor;
    return; // Exit early if over a UI element
  };

  let topItem = null;

  // Iterate in reverse to prioritize the topmost item
  for (let i = inGameItems.length - 1; i >= 0; i--) {
    const item = inGameItems[i];
    const isHovered =
      offsetX >= item.drawPosition.x &&
      offsetX <= item.drawPosition.x + 64 &&
      offsetY >= item.drawPosition.y &&
      offsetY <= item.drawPosition.y + 64 &&
      isItemInRangeOfPlayer(item);

    if (isHovered) {
      topItem = item;
      break; // Stop at the first (topmost) item
    };
  };

  // Update hover states
  inGameItems.forEach(item => item.hover = item === topItem);

  // Update cursor appearance
  if (inGameItems.some(item => item.held)) {
    canvas.style.cursor = "grabbing"; // Keep grabbing if an item is held
  } else if (topItem) {
    canvas.style.cursor = "grab"; // Set grab if hovering over an item
  } else {
    canvas.style.cursor = "crosshair"; // Default cursor otherwise
  }
};

const handleMouseDown = (e) => {
  inGameItems.forEach(item => {
    if (item.hover) {
      item.held = true;
      canvas.style.cursor = 'grabbing';
    };
  });
};

const handleMouseUp = (e) => {
  inGameItems.forEach(item => {
    if (item.held) {
      const newFrameX = player.data.details.location.x + Math.floor((e.offsetX - 384) / 64);
      const newFrameY = player.data.details.location.y + Math.floor((e.offsetY - 320) / 64);
      const newWorldPosition = { x: newFrameX, y: newFrameY };

      const equipSlot = getEquipSlotUnderCursor(e);
      const inventorySlot = getInventorySlotUnderCursor(e);

      if (equipSlot && uiState === 'inventory') {
        moveToEquip(item, equipSlot);

      } else if (inventorySlot && uiState === 'inventory') {
        // moveToInventory(item, slot);

      } else if (
        newWorldPosition.x >= 0 &&
        newWorldPosition.x < renderArea.width &&
        newWorldPosition.y >= 0 &&
        newWorldPosition.y < renderArea.height
      ) {
        item.worldPosition = newWorldPosition;
        unequipItem(item);
        updateItemDrawPosition(item);
      };

      item.held = false;
    };
  });

  // Reset cursor after dropping item
  canvas.style.cursor = 'crosshair';

  drawAll(); // Redraw after moving an item
};

// handle player movement -------------------------------------------------------
const canMove = (boundaryTiles, newX, newY) => {
  return !boundaryTiles.some(boundary => 
    newX === boundary.dx && newY === boundary.dy
  );
};

const updateCursorAfterMove = () => {
  const event = new MouseEvent("mousemove", {
    clientX: lastMouseX, 
    clientY: lastMouseY
  });
  canvas.dispatchEvent(event);
};

const playerMove = e => {
  if (!game.on || chat.on || player.cooldown) return;

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
    drawAll();
    updateCursorAfterMove(); // Ensure cursor updates even when just turning
    return;
  };

  const newX = centerX + movementOffsets[key].x;
  const newY = centerY + movementOffsets[key].y;

  if (canMove(boundaryTiles, newX, newY)) {
    player.data.details.location.x += movementOffsets[key].x / tileSize;
    player.data.details.location.y += movementOffsets[key].y / tileSize;
  };

  drawAll();
  updateCursorAfterMove(); // Simulate mouse movement to update cursor after movement

  player.cooldown = true;
  setTimeout(() => player.cooldown = false, player.speed * 1000);
};

// handle player "login" --------------------------------------------------------
const handleLogin = async e => {
  e.preventDefault();

  const capitalizeWords = input => {  
    return input.split(' ').map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const nameInput = document.querySelector('#playername').value.trim();
  const playerName = capitalizeWords(nameInput);
  player.data = resources.createPlayer(playerName);
  // resources.itemData.itemsInGame.length > 0 && inGameItems.push(resources.itemData.itemsInGame);
  populateInGameItems();
  
  setTimeout(() => {
    const form = document.querySelector('.form-container');
    form.style.display = 'none';
    form.blur();

    game.on = true;

    document.querySelector('.background').remove();
    document.querySelector('.game-container')?.classList.remove('hidden');
    canvas.style.cursor = 'crosshair';
    
    // gameLoop();
    drawAll();
  }, 500);
};

// handle player "logout" -------------------------------------------------------
const updateLocalPlayerData = () => {
  // Remove any `null` values from the array
  resources.playerData.playerlist = resources.playerData.playerlist.filter(user => user !== null);

  const playerIndex = resources.playerData.playerlist.findIndex(user => user.id === player.data.id);

  if (playerIndex !== -1) {
    resources.playerData.playerlist[playerIndex] = player.data;
  } else {
    console.warn('New player added.');
    resources.playerData.playerlist.push(player.data);
  };
};

const updateLocalItemData = () => {
  resources.itemData.itemsInGame = inGameItems.map(item => ({ ...item })); // Deep copy
};

const postGameData = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save game data. Server error.');
    }
  } catch (error) {
    console.error('Error saving game data:', error.message);
  }
};

const updateAndPostGameData = async () => {
  updateLocalPlayerData();
  updateLocalItemData();

  await Promise.all([
    postGameData(API_URL_PLAYER, resources.playerData),
    postGameData(API_URL_ITEMS, resources.itemData)
  ]);
};

// event listeners --------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });

  addEventListener('keydown', playerMove);

  canvas.addEventListener("mousedown", e => {
    handleMouseDown(e);
    handleUiStates(e);
  });

  canvas.addEventListener("mousemove", e => {
    handleMouseMove(e);
    handleUiStates(e);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }); 

  canvas.addEventListener("mouseup", e => {
    handleMouseUp(e);
  });

  // window.addEventListener('resize', resizeCanvas);

  addEventListener('beforeunload', async (e) => {
    await updateAndPostGameData();
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
/game
  ├── index.js          (Main entry point)
  ├── config.js         (Game settings, constants)
  ├── engine.js         (Game loop and core engine logic)
  ├── renderer.js       (Handles rendering logic)
  ├── player.js         (Handles player movement and logic)
  ├── world.js          (World map, boundaries, and collisions)
  ├── items.js          (Item handling, interactions)
  ├── ui.js             (UI management - inventory, equip section)
  ├── events.js         (Event listeners, key/mouse input handling)
*/

/* 
function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};
*/