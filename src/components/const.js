// canvas variables
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.uiWidth = 192;

// game variables
const chat = {
  on: false
};

const game = {
  on: false
};

// path variables
const API_URL_ITEMS = '/saveItemData';
const API_URL_PLAYER = '/savePlayerData';

// movement variables
const centerX = 384;
const centerY = 320;
const tileSize = 64;

// map variables
const equipSlotSize = 64;
const inventorySlotSize = 32;
const uppermostTileIDs = [30, 31, 300, 301, 320, 321, 322, 323, 324, 340, 343, 360, 362, 363, 380, 383];
const waterTileIDs = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// render variables
const renderArea = {
  size: { row: 11, col: 13 },
  width: canvas.width - canvas.uiWidth, 
  height: canvas.height
};

// ui variables
const equipSlots = {
  back: { x: 960, y: 0 },
  chest: { x: 896, y: 64 },
  feet: { x: 960, y: 128 },
  hands: { x: 832, y: 128 },
  head: { x: 896, y: 0 },
  legs: { x: 896, y: 128 },
  mainhand: { x: 832, y: 64 },
  neck: { x: 832, y: 0 },
  offhand: { x: 960, y: 64 }
};

const inventory = {
  expanded: false,
  one: { item: null, open: false, scroll: 0 },
  two: { item: null, open: false, scroll: 0 }
};

const arrows = {
  downActive: { x: 256, y: 640 + 16 }, 
  downInactive: { x: 320, y: 640 + 16 }, 
  upActive: { x: 128, y: 640 + 16 }, 
  upInactive: { x: 192, y: 640 + 16 },
  firstArea: { 
    down: { x: renderArea.width + 128, y: 192 + 64 },
    up: { x: renderArea.width, y: 192 + 64 }
  },
  secondArea: { 
    down: { x: renderArea.width + 128, y: 192 + 64 + 32 + 160 },
    up: { x: renderArea.width, y: 192 + 64 + 32 + 160 }
  }
};

const inventorySlots = {
  primary: {
    header: { x: renderArea.width, y: 192 + 64, width: 192, height: 32 },
    slots: { x: renderArea.width, y: 192 + 64 + 32, width: 192, height: 160, expandedHeight: 352 }
  },
  secondary: {
    header: { x: renderArea.width, y: 192 + 64 + 32 + 160, width: 192, height: 32 },
    slots: { x: renderArea.width, y: 192 + 64 + 32 + 160 + 32, width: 192, height: 160 }
  }
};

export { 
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
};