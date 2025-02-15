// items.js
import { ctx, renderArea, inGameItems } from "../components/const.js";
import { resources } from '../utils/resources.js'
import { generateHexId } from "./utils.js";

/**
 * Creates a new item instance from the base item data.
 * @param {string} name - The name of the item to create.
 * @param {string} location - The location category ("world", "inventory", "npc-corpse", etc.).
 * @param {object|null} coordinates - The world position (only used for world items).
 * @returns {object|null} The created item or null if the item is not found.
 */
export const createNewItem = (name, location, coordinates = null) => {
  const baseItem = resources.itemData.items.find(it => it.name === name);
  if (!baseItem) {
    console.error(`Item "${name}" not found in itemData.`);
    return null;
  }

  const newItem = {
    ...baseItem,
    id: generateHexId(),
    category: location,
    worldPosition: location === "world" ? coordinates : null,
  };

  inGameItems.push(newItem);
  return newItem;
};

/**
 * Draws an item onto the canvas.
 * @param {object} item - The item to draw.
 */
export const drawItem = (item) => {
  if (item.worldPosition) updateItemDrawPosition(item);

  const { spritePosition, drawPosition } = item;
  const size = 64;

  ctx.drawImage(
    resources.items.image,
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

/**
 * Checks if an item is within the render area.
 * @param {object} item - The item to check.
 * @returns {boolean} True if the item is within the render area, false otherwise.
 */
export const isItemInRenderArea = (item) => {
  return (
    item.worldPosition &&
    item.worldPosition.x >= 0 &&
    item.worldPosition.x < renderArea.width &&
    item.worldPosition.y >= 0 &&
    item.worldPosition.y < renderArea.height
  );
};

/**
 * Determines if an item is within range of the player (same or adjacent frame).
 * @param {object} item - The item to check.
 * @param {object} player - The player object containing location data.
 * @returns {boolean} True if the item is within range, false otherwise.
 */
export const isItemInRangeOfPlayer = (item, player) => {
  const { x: playerX, y: playerY } = player.data.details.location;

  if (!item.worldPosition) return false;

  const dx = Math.abs(item.worldPosition.x - playerX);
  const dy = Math.abs(item.worldPosition.y - playerY);

  return dx <= 1 && dy <= 1;
};

/**
 * Updates the draw position of an item relative to the visible render area.
 * @param {object} item - The item to update.
 * @param {object} player - The player object containing location data.
 */
export const updateItemDrawPosition = (item, player) => {
  const { x: playerX, y: playerY } = player.data.details.location;
  const { col, row } = renderArea.size;

  const visibleStartX = playerX - Math.floor(col / 2);
  const visibleStartY = playerY - Math.floor(row / 2);

  const newX = (item.worldPosition.x - visibleStartX) * 64;
  const newY = (item.worldPosition.y - visibleStartY) * 64;

  Object.assign(item.drawPosition, { x: newX, y: newY });
};

/**
 * Populates the inGameItems array with items from itemData.
 */
export const populateInGameItems = () => {
  if (!Array.isArray(resources.itemData.itemsInGame)) {
    console.error("Error: itemsInGame is not an array.");
    return;
  }

  inGameItems.length = 0; // Clear the array before populating

  inGameItems.push(
    ...resources.itemData.itemsInGame.map(item => ({
      ...item,
      id: item.id || generateHexId(),
    }))
  );
};
