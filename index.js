import { resources } from './src/resources.js';
import { Player } from './src/class.js';

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

const player = new Player({});

// handle login/transition to game
const handleLogin = async e => {
  e.preventDefault();
  
  const form = document.querySelector('.form-container');
  const playerName = document.querySelector('#playername').value;
  player.data = resources.createPlayer(playerName);

  console.log(player.data)
  // await new Promise((resolve) => {
  //   const checkInterval = setInterval(() => {
  //     if (typeof resources !== 'undefined') {
  //       clearInterval(checkInterval);
  //       resolve();
  //     };
  //   }, 100);
  // });

  // game.on = true;

  // a half second between form submission and game because the instant transition feels weird
  // setTimeout(() => {
  //   if (game.on) {
      // document.querySelector('body').style.background = '#464646';
      // canvas.style.background = 'transparent';

      // form.style.display = 'none';
      // form.blur();
      
      // game.classList.remove('hidden');
      // game.style.display = 'flex';
      // game.on = true;
  //     console.log(player.data)
  //   };
  // }, 500);
};

// event listeners -----------------------------------------------
addEventListener("DOMContentLoaded", e => {
  // handleDOMContentLoaded();
  
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });

  // addEventListener('beforeunload', async (e) => {
  //   await updateAndPostPlayerData();
  // });
});