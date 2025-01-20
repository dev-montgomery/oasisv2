// Base class for objects with common properties
class GameObject {
  constructor({ src, size }) {
    this.image = new Image();
    this.image.src = src || '';
    // this.source = source || '';
    // this.coordinates = coordinates || '';
    this.size = size || 64;
  };

  // Ensure that the image is loaded
  loadImage = () => {
    return new Promise((resolve, reject) => {
      this.image.onload = resolve;
      this.image.onerror = reject;
    });
  };
};

export class Player extends GameObject {
  constructor({ sprite }) {
    super({ src: '../backend/assets/player_data/assets-player.png', sprite })
    const { x, y } = sprite;
    this.x = x;
    this.y = y;
    this.drawTo = { 
      x: screen.width * 0.5 - 128, 
      y: screen.height * 0.5 - 128
    };
  };

  draw = (ctx) => {
    ctx.drawImage(
      this.image,
      this.x,
      this.y,
      this.size + 64,
      this.size + 64,
      this.drawTo.x,
      this.drawTo.y - 64,
      this.size + 64,
      this.size + 64
    );
  };
};

// export class Tile extends GameObject {
//   constructor({ source, coordinates }) {
//     super({ src: '../backend/assets/map_data/spritesheet-genus.png', source, coordinates });
//   };
// };

// export class Item extends GameObject {
//   constructor(id, type, name, { source, coordinates }, scale) {
//     super({ src: '../backend/assets/item_data/items.png', source, coordinates });
//     this.id = id;
//     this.type = type;
//     this.name = name;
//     this.scale = scale;
//     this.size = 64;
//     this.isDragging = false;
//   };

//   draw = (ctx) => {
//     ctx.drawImage(
//       this.image,
//       this.source.sx,
//       this.source.sy,
//       this.size,
//       this.size,
//       this.coordinates.dx,
//       this.coordinates.dy,
//       this.size * this.scale,
//       this.size * this.scale
//     );
//   };
// };