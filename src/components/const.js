// canvas variables
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.uiWidth = 192;

// game variables
const renderArea = {
  size: { row: 11, col: 13 },
  width: canvas.width - canvas.uiWidth, 
  height: canvas.height
};

const game = {
  on: false
};

const chat = {
  on: false
};

// path variables
const API_URL_PLAYER = '/savePlayerData';
const API_URL_ITEMS = '/saveItemData';

// movement variables
const tileSize = 64;
const centerX = 384;
const centerY = 320;

// map variables
const waterTileIDs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const uppermostTileIDs = [30, 31, 300, 301, 320, 321, 322, 323, 324, 340, 343, 360, 362, 363, 380, 383];
const equipSlotSize = 64;
const inventorySlotSize = 32;

// ui variables
const equipSlots = {
  neck: { x: 832, y: 0 }, 
  head: { x: 896, y: 0 }, 
  back: { x: 960, y: 0 },
  mainhand: { x: 832, y: 64 }, 
  chest: { x: 896, y: 64 }, 
  offhand: { x: 960, y: 64 },
  hands: { x: 832, y: 128 }, 
  legs: { x: 896, y: 128 }, 
  feet: { x: 960, y: 128 }
};

const inventorySlots = {
  primary: {
    1: {}, 2: {}, 3: {}, 4: {}, 5: {},
    6: {}, 7: {}, 8: {}, 9: {}, 10: {},
    11: {}, 12: {}, 13: {}, 14: {}, 15: {},
    16: {}, 17: {}, 18: {}, 19: {}, 20: {},
  },
  secondary: {
    1: {}, 2: {}, 3: {}, 4: {}, 5: {},
    6: {}, 7: {}, 8: {}, 9: {}, 10: {},
    11: {}, 12: {}, 13: {}, 14: {}, 15: {},
    16: {}, 17: {}, 18: {}, 19: {}, 20: {},
  }
};

export { API_URL_PLAYER, API_URL_ITEMS, canvas, ctx, renderArea, game, chat, tileSize, centerX, centerY, waterTileIDs, uppermostTileIDs, equipSlots, equipSlotSize, inventorySlots, inventorySlotSize };