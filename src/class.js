export class Player {
  constructor() {
    this.image = new Image();
    this.image.src = '../backend/assets/player_data/assets-player.png';
    this.pixels = 64;
    this.speed = 1;
    this.direction = 'down';
    this.cooldown = false;
    this.drawTo = { 
      x: window.innerWidth * 0.5 - 128,
      y: window.innerHeight * 0.5 - 128 
    };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load player image.'));
    });
  };
};

export class Area {
  constructor() {
    this.image = new Image();
    this.image.src = './backend/assets/map_data/assets-map.png';
    this.frames = 20;
    this.pixels = 64;
    this.mapDimensions = { row: 200, col: 200 };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };
};