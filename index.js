import { resources } from './src/resources.js';
import { Player } from './src/class.js';

// put in .dotenv file
const API_URL = 'http://localhost:3000/playerdata';

const game = document.querySelector('.game-container');
game.on = false;

// canvas and context and screen sizes ---------------------------
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.panelwidth = 192;

const screen = { frames: { row: 11, col: 13 }, width: canvas.width - canvas.panelwidth, height: canvas.height };

// load image assets ---------------------------------------------
const mapAssets = {
  image: new Image(),
  src: './backend/assets/map_data/assets-map.png',
  pixels: 64,
  mapSize: { rows: 200, cols: 200 },
  loaded: false
};

const panelAssets = {
  image: new Image(),
  src: './backend/assets/assets-inventory.png',  
};

// init player, populate player data, update player data
const player = new Player({});

// handle form
const handleLogin = async (e) => {
  e.preventDefault();
  
  const playerName = document.querySelector('#playername').value.trim();
  player.data = resources.createPlayer(playerName);

  console.log(player.data);

  setTimeout(() => {
    // if (genus.loaded && player.loaded) {
      const form = document.querySelector('.form-container');
      form.style.display = 'none';
      form.blur();
    // };
  }, 500);
};

// update player data
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

// event listeners -----------------------------------------------
addEventListener("DOMContentLoaded", e => {
  // handleDOMContentLoaded();
  
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });
  
  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });
});