import { resources } from './src/utils/resources.js';
import { Player, Area, UiElements, Items, Creatures } from './src/utils/classes.js';
import { characterSheet } from './src/components/stats.js';
import { generateHexId } from './src/utils/utils.js';
import { 
  API_URL_ITEMS, 
  API_URL_PLAYER, 
  canvas, 
  centerX, 
  centerY, 
  chat, 
  ctx, 
  equipSlotSize, 
  equipSlots, 
  game, 
  inventory, 
  inventorySlotSize, 
  inventorySlots, 
  renderArea, 
  tileSize, 
  uppermostTileIDs, 
  waterTileIDs
} from './src/components/const.js';

// Initiations
const player = new Player();
const area = new Area();
const uiElements = new UiElements();
const items = new Items();
const creatures = new Creatures();

let lastMouseX = 0;
let lastMouseY = 0;
let boundaryTiles = [];
let waterTiles = [];
let uppermostTiles = [];
let uiState = 'player';
let uiStance = 'passive';
let inGameItems = [];
let heldItem = null;
let lastValidPosition = null;

// Draw Functions
const drawAll = () => {
  // Populate Character Sheet
  characterSheet(player.data);

  // Draw the map (background) and Player
  drawArea();

  // Draw UI elements last so they appear on top
  drawUi();

  
  // Draw all non-player items like objects or enemies
  inGameItems.forEach(item => {
    if (isInRenderArea(item) && item.category === 'world') {
      drawItem(item);
    };
    
    if (isInEquipArea(item) && item.category === 'equipped' && uiState === 'inventory') {
      drawItem(item);
    };
  });

  drawInventory();
  
  // Draw player before uppermost layer
  player.draw(ctx);

  // Draw upper tiles after all others
  uppermostTiles.forEach(tileData => drawTile(area.image, tileData));
};

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
    drawInventory();
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

const drawItem = (item) => {
  if (!item) return;
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

const drawInventory = () => {
  const primary = inventorySlots.primary;
  const secondary = inventorySlots.secondary;

  // Clear and draw inventory background
  ctx.clearRect(renderArea.width, 256, 192, 384);
  ctx.drawImage(uiElements.image, 192, 0, 192, 384, renderArea.width, 256, 192, 384);

  const drawInventorySection = (container, section, scroll, expanded) => {
    if (!container) return; // Ensure there's a valid inventory object

    const numOfRows = expanded && section === 1 ? 11 : 5;
    const size = 32;
    let position = scroll * 6;

    const header = section === 1 ? primary.header : secondary.header;
    const slots = section === 1 ? primary.slots : secondary.slots;

    const drawInventorySlot = (x,y) => {
      // Draw the white square
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, size, size);
  
      // Draw the light gray border
      ctx.strokeStyle = "lightgray";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    };

    // Draw inventory header
    ctx.drawImage(items.image, container.spritePosition.x, container.spritePosition.y, 64, 64, header.x + 64 + 16, header.y, size, size);

    // Draw inventory slots and contents
    for (let row = 0; row < numOfRows * 6; row++) {
      const x = slots.x + (row % 6) * size;
      const y = slots.y + Math.floor(row / 6) * size;

      
      if (position < container.stats.slots) {
        // ctx.drawImage(uiElements.image, 0, 576, 64, 64, x, y, size, size);
        drawInventorySlot(x, y);
        const item = container.contents[position];

        if (typeof item === 'object') {
          ctx.drawImage(items.image, item.spritePosition.x, item.spritePosition.y, 64, 64, x, y, size, size);
        };
      };

      position++;
    };
  };

  if (uiState === 'inventory') {
    if (inventory.one.open && !inventory.two.open) {
      drawInventorySection(inventory.one.item, 1, inventory.one.scroll, true);
    };

    if (inventory.two.open) {     
      drawInventorySection(inventory.one.item, 1, inventory.one.scroll, false);
      drawInventorySection(inventory.two.item, 2, inventory.two.scroll, false);
    };
  };
};

// Handle ui
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

// Handle item behavior
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

const populateInGameItems = () => {
  if (!Array.isArray(resources.itemData.itemsInGame)) {
    console.error("Error: itemsInGame is not an array.");
    return;
  };

  inGameItems = resources.itemData.itemsInGame.map(item => ({
    ...item, // Copy existing item properties
    id: generateHexId(), // Ensure each item has a unique ID
  }));
};

const updateItemsArray = (item) => {
  const index = inGameItems.findIndex(curr => curr.id === item.id);

  if(index > -1) {
    inGameItems.splice(index, 1);
    inGameItems.push(item);
  };
};

const clearHoverStates = () => {
  inGameItems.forEach(item => item.hover = false);
};

const updateItemHoverState = (offsetX, offsetY) => {
  clearHoverStates(); // Clear all hover states first
  let hoverDetected = false;

  // Iterate from topmost to bottommost for accurate hover detection
  for (let i = inGameItems.length - 1; i >= 0; i--) {
    const item = inGameItems[i];

    // Check if the item is in the equip area or within the player's range
    const isHoverable = isInEquipArea(item) || isInRangeOfPlayer(item);
    if (!isHoverable) continue;

    // Check if the cursor is over the item
    if (isCursorOverItem(item, offsetX, offsetY)) {
      item.hover = true;
      canvas.style.cursor = "grab";
      hoverDetected = true;
      break; // Stop at the first hovered item (topmost)
    };
  };

  return hoverDetected;
};

const updateItemDrawPosition = (item) => {
  if (!item || item.worldPosition === null) return;

  const playerLocation = player.data.details.location;
  const pixels = 64;

  item.drawPosition.x = (item.worldPosition.x - playerLocation.x) * pixels + 384;
  item.drawPosition.y = (item.worldPosition.y - playerLocation.y) * pixels + 320;
};

const resetItemPosition = (item, lastValidPosition) => {
  if (!item || !lastValidPosition) return;

  const { x, y } = lastValidPosition;

  item.drawPosition.x = x;
  item.drawPosition.y = y;
  item.held = false;
  item.hover = false;

  const index = inGameItems.findIndex(curr => curr.id === item.id);

  inGameItems.splice(index, 1);
  inGameItems.push(item);
};

// Handling items between sections
const moveToEquip = (item, slot) => {
  if (!item || item.type !== slot) return; // Ensure valid item type
  
  const existingItem = player.data.details.equipped[slot];

  if (typeof(existingItem) === 'object') {
    if (existingItem.id === item.id) return; 
    
    // Swap items
    Object.assign(existingItem, {
      category: 'world',
      worldPosition: item.worldPosition,
      held: false
    });
    
    updateItemDrawPosition(existingItem);
  };
  
  // Equip new item
  Object.assign(item, {
    category: 'equipped',
    worldPosition: null,
    drawPosition: { x: equipSlots[slot].x, y: equipSlots[slot].y },
    held: false
  });

  console.log(`Equipped ${item.name} in ${slot} slot.`);
  player.data.details.equipped[slot] = item;
  updateItemsArray(item);
  
  drawAll();
};

const moveToInventory = (item, container) => {
  if (!item || !container) return;

  if (container.contents.length <= container.stats.slots) {
    Object.assign(item, {
      category: 'inventory',
      worldPosition: null,
      held: false
    });
    
    container.contents.push(item);
  };

  updateItemsArray(item);
  drawAll();
};

const moveToRenderArea = (item, newFrameX, newFrameY) => {
  const equippedItem = inGameItems.find(equipped => equipped.id === item.id);

  if (equippedItem) {
    Object.assign(item, {
      category: 'world',
      worldPosition: { x: newFrameX, y: newFrameY },
      held: false
    });

    player.data.details.equipped[item.type] = 'empty';
  } else {
    Object.assign(item, {
      worldPosition: { x: newFrameX, y: newFrameY },
      held: false
    });
  }; 

  updateItemDrawPosition(item);
  updateItemsArray(item);
};

// Check valid areas
const isMouseOnCanvas = (x, y) => (
  Number.isFinite(x) && Number.isFinite(y) &&
  x >= 0 && x < canvas.width &&
  y >= 0 && y < canvas.height
);

const isCursorOverItem = (item, offsetX, offsetY, size = 64) => {
  return (
    offsetX >= item.drawPosition.x &&
    offsetX <= item.drawPosition.x + size &&
    offsetY >= item.drawPosition.y &&
    offsetY <= item.drawPosition.y + size
  );
};

const isInRangeOfPlayer = (item) => {
  const playerFrameX = player.data.details.location.x;
  const playerFrameY = player.data.details.location.y;

  const dx = item.worldPosition && Math.abs(item.worldPosition.x - playerFrameX);
  const dy = item.worldPosition && Math.abs(item.worldPosition.y - playerFrameY);
  
  return dx <= 1 && dy <= 1; // Ensures the item is in the player's frame or an adjacent frame
};

const isInRenderArea = (item) => {
  // Ensure worldPosition exists and has valid numbers for x and y
  if (
    !item.worldPosition || 
    typeof item.worldPosition.x !== 'number' || 
    typeof item.worldPosition.y !== 'number'
  ) {
    return false;
  };

  const { x, y } = item.worldPosition;
  const playerX = player.data.details.location.x;
  const playerY = player.data.details.location.y;

  // Calculate the render area's boundaries
  const startX = playerX - Math.floor(renderArea.size.col / 2);
  const endX = playerX + Math.floor(renderArea.size.col / 2); 
  const startY = playerY - Math.floor(renderArea.size.row / 2);
  const endY = playerY + Math.floor(renderArea.size.row / 2);

  // Check if the item is within the render area
  return x >= startX && x <= endX && y >= startY && y <= endY;
};

const isInEquipArea = (item) => {
  const { x, y } = item.drawPosition;
  
  return Object.values(equipSlots).some(slot =>
    x === slot.x && y === slot.y && uiState === 'inventory'
  );
};

// Mouse Event Handlers
const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;

  // Check for UI interactions first
  const uiCursor = handleUiStates(e);
  if (uiCursor) {
    canvas.style.cursor = uiCursor;
    return;
  }

  // Default cursor state
  canvas.style.cursor = "crosshair";

  // If an item is held, update its position and cursor state
  if (heldItem) {
    canvas.style.cursor = "grabbing";
    return;
  }

  // Update hover states for in-game items
  if (updateItemHoverState(offsetX, offsetY)) return;
};

const handleMouseDown = (e) => {
  if (e.button !== 0) return; // Left click only

  // Ensure only one hovered item
  clearHoverStates();
  const { offsetX, offsetY } = e;
  updateItemHoverState(offsetX, offsetY);

  // Find hovered item to hold
  const hoveredItem = inGameItems.find(item => item.hover);

  // Ensure a valid item is found and prevent holding multiple items
  if (hoveredItem && !heldItem) {
    hoveredItem.held = true;
    hoveredItem.hover = false;
    hoveredItem.lastValidPosition = { ...hoveredItem.drawPosition };
    heldItem = hoveredItem;
    canvas.style.cursor = "grabbing";
  }
};

const handleMouseUp = (e) => {
  if (!heldItem) return;

  const { offsetX, offsetY } = e;
  const newFrameX = player.data.details.location.x + Math.floor((offsetX - 384) / 64);
  const newFrameY = player.data.details.location.y + Math.floor((offsetY - 320) / 64);

  // Check valid drop locations
  const inRenderArea = offsetX >= 0 && offsetX < 832 && offsetY >= 0 && offsetY < 704;
  const inEquipSlot = Object.keys(equipSlots).find(slot => {
    const { x, y } = equipSlots[slot];
    return offsetX >= x && offsetX < x + 64 && offsetY >= y && offsetY < y + 64 ? slot : null;
  });
  const inFirstBag = 
    offsetX >= inventorySlots.primary.slots.x && 
    offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
    offsetY >= inventorySlots.primary.slots.y && 
    offsetY < inventorySlots.primary.slots.y + inventorySlots.primary.slots.height;
  const inFirstBagExpanded = 
    offsetX >= inventorySlots.primary.slots.x && 
    offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
    offsetY >= inventorySlots.primary.slots.y && 
    offsetY < inventorySlots.primary.slots.y + inventorySlots.primary.slots.expandedHeight;
  const inSecondBag = 
    offsetX >= inventorySlots.secondary.slots.x && 
    offsetX < inventorySlots.secondary.slots.x + inventorySlots.secondary.slots.width && 
    offsetY >= inventorySlots.secondary.slots.y && 
    offsetY < inventorySlots.secondary.slots.y + inventorySlots.secondary.slots.height;

  // Handle item drop logic
  if (uiState === 'inventory') {
    if (inEquipSlot) moveToEquip(heldItem, inEquipSlot);
    if (inFirstBagExpanded && inventory.one.open && !inventory.two.open || inFirstBag && inventory.one.open) {
      moveToInventory(heldItem, inventory.one.item);
      console.log('inFirstBag')
    };
    if (inSecondBag && inventory.two.open) {
      moveToInventory(heldItem, inventory.two.item);
      console.log('inSecondBag')
    };
  };
  
  if (inRenderArea) {
    moveToRenderArea(heldItem, newFrameX, newFrameY);
  } else {
    resetItemPosition(heldItem, lastValidPosition);
  };

  // Clear held state
  heldItem = null;
  canvas.style.cursor = "crosshair";
  drawAll();
};

const handleRightClick = (e) => {
  e.preventDefault(); // Prevents the default right-click context menu

  const { offsetX, offsetY } = e;
  const item = inGameItems.find(item => isCursorOverItem(item, offsetX, offsetY));

  if (!item || !item.contents) return; // Only proceed if the item has a 'content' property
  
  if (uiState === 'inventory') {
    if(isInRangeOfPlayer(item) || player.data.details.equipped.back === item) {
      if (!inventory.one.item) {
        inventory.one.item = item;
        inventory.one.open = true;
        inventory.expanded = true;
      } else if (item !== inventory.one.item && !inventory.two.item) {
        inventory.two.item = item;
        inventory.two.open = true;
        inventory.expanded = false;
      } else if (inventory.one.item === item) {
        inventory.one.item = null;
        inventory.one.open = false;
        inventory.expanded = false;
    
        if (inventory.two.item) {
          inventory.one.item = inventory.two.item;
          inventory.one.open = inventory.two.open;
          inventory.two.item = null;
          inventory.two.open = false;
          inventory.expanded = true;
        }
      } else if (inventory.two.item === item) {
        inventory.two.item = null;
        inventory.two.open = false;
        inventory.expanded = true;
      };
      console.log("Inventory state updated:", inventory);
      drawInventory();
    };
  };
};

// Player movement
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
  };
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

  canvas.addEventListener("contextmenu", e => {
    handleRightClick(e);
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

Next :: 
add favicon
when items are thrown onto certain tiles, it should delete the item, and can't throw on collision tiles
equipped items should increase stats
inventory behavior
fix updating json
depot interaction

modularize code
fix top layer. The layers aren't correct for every spot...
fix save, player currently doesn't save accurately
need to add player.json stats so that equipping items affects stats
maybe only show skill stat depending on the item(s) that is equipped
implement npcs, npc behavior, player ui
chatbox to interact with npcs
code money behavior
enemy behavior, attacking and looting
animations
health recovery, mana recovery
spells
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