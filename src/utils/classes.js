const screenWidth = 832;
const screenHeight = 704;

export class Player {
  constructor() {
    this.image = new Image();
    this.image.src = '../backend/assets/player_data/assets-player.png';
    this.pixels = 64;
    this.speed = 0.5;
    this.direction = { x: 0, y: 128 };
    this.cooldown = false;
    this.drawTo = { 
      x: (screenWidth / 2) - (this.pixels / 2 + this.pixels),
      y: (screenHeight / 2) - (this.pixels / 2 + this.pixels)
    };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load player image.'));
    });
  };

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.direction.x,
      this.direction.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels,
      this.drawTo.x,
      this.drawTo.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels
    );
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