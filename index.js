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
const playerAssets = {
  image: new Image(),
  src: './backend/assets/player_data/assets-player.png'
};

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

// items

// creatures

// animations

// init player ---------------------------------------------------
const player = new Player({ 
  sprite: { x: 0, y: 128 },
  drawTo: { 
    x: screen.width * 0.5 - 64, 
    y: screen.height * 0.5 - 64
  }
});

player.loadImage().then(() => {
  player.loaded = true;
});

// append map ----------------------------------------------------
// const drawTile = (image, tile) => {
//   const { sx, sy } = tile.source;
//   const { dx, dy } = tile.coordinates;
//   const size = tile.size;
//   ctx.drawImage(image, sx, sy, size, size, dx, dy, size, size);
// };

// const detectCollision = (objects, newX, newY) => {
//   for (let i = 0; i < objects.length; i++) {
//     const obj = objects[i];
//     if (
//       newX < obj.coordinates.dx + obj.size &&
//       newX + player.size > obj.coordinates.dx &&
//       newY < obj.coordinates.dy + obj.size &&
//       newY + player.size > obj.coordinates.dy
//     ) {
//       return true;
//     };
//   };
//   return false;
// };

// const collisionDetect = (newX, newY) => {
//   return detectCollision(boundaries, newX, newY);
// };

// const waterDetect = (newX, newY) => {
//   return detectCollision(wateries, newX, newY);
// };
const drawArea = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
  
  //   const upperTiles = [ 576, 577, 578, 579, 601, 602, 603, 604 ];
//   const waterTiles = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
//   boundaries = [];
//   wateries = [];
//   uppermost = [];

  // const startingTile = {
  //   x: player.data.details.location.x - Math.floor(screen.frames.col / 2),
  //   y: player.data.details.location.y - Math.floor(screen.frames.row / 2)
  // };

  // const visibleMap = currentMap.map(layer => {
  //   startingTile.num = genus.mapFrameDimensions.col * (startingTile.y - 1) + startingTile.x;
  //   let tiles = [];
  //   for (let i = 0 ; i < screen.frames.row ; i++) {
  //     tiles.push(...layer.data.slice(startingTile.num, startingTile.num + screen.frames.col));
  //     startingTile.num += genus.mapFrameDimensions.col;
  //   };
  //   return tiles;
  // });

  // visibleMap.forEach(layer => {
  //   layer.forEach((tileID, i) => {
  //     if (tileID > 0) {
  //       const sx = (tileID - 1) % genus.spritesheetFrames * genus.size;
  //       const sy = Math.floor((tileID - 1) / genus.spritesheetFrames) * genus.size;
  //       const dx = i % screen.frames.col * genus.size;
  //       const dy = Math.floor(i / screen.frames.col) * genus.size;

        // if (upperTiles.includes(tileID)) {
        //   const upper = new Tile({ source: { sx, sy }, coordinates: { dx, dy } });
        //   upper.tileID = tileID;
        //   uppermost.push(upper);
        // };

        // if (waterTiles.includes(tileID)) {
        //   const water = new Tile({ source: { sx, sy }, coordinates: { dx, dy } });
        //   wateries.push(water);
        // };

        // if (tileID === 25) {
        //   const boundary = new Tile({ coordinates: { dx, dy } });
        //   boundaries.push(boundary);
        // } else {
        //   drawTile(genus.image, { source: { sx, sy }, coordinates: { dx, dy }, size: 64 });
        // };
    //   };
    // });
  // });
  
  // items.forEach(item => {
  //   if (
  //     item.coordinates.dx >= 0 &&
  //     item.coordinates.dx + item.size <= screen.width &&
  //     item.coordinates.dy >= 0 &&
  //     item.coordinates.dy + item.size <= screen.height
  //   ) {
  //     item.draw(ctx);
  //   };
  // });

  // player.draw(ctx);
  // uppermost.forEach(tile => {
  //   drawTile(
  //     genus.image, 
  //     { 
  //       source: { sx: tile.source.sx, sy: tile.source.sy }, 
  //       coordinates: { dx: tile.coordinates.dx, dy: tile.coordinates.dy }, 
  //       size: tile.size 
  //     }
  //   );
  // });
};




// append player and movement

// map collision

// rightside panel

// equipment section

// inventory section

// item attributes

// leftside panel


// handle "player login" -------- some day use mongoose ----------
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
  }, 500);
  drawArea();
  console.log(player)
  player.draw(ctx);
};

// update player data --------------------------------------------
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
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });
  
  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });
});