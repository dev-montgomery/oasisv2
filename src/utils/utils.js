// Generate unique id
const generateHexId = () => {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};

// Check if the cursor is over an item
const isCursorOverItem = (item, offsetX, offsetY) => {
  return (
    offsetX >= item.drawPosition.x &&
    offsetX <= item.drawPosition.x + 64 &&
    offsetY >= item.drawPosition.y &&
    offsetY <= item.drawPosition.y + 64
  );
};

// Clear all hover states
const clearHoverStates = (inGameItems) => {
  inGameItems.forEach(item => item.hover = false);
};

// Update Item Hover State
const updateItemHoverState = (offsetX, offsetY, inGameItems, canvas, isItemInRangeOfPlayer) => {
  clearHoverStates(inGameItems); // Ensure no lingering hover states
  let hoverDetected = false;

  // Check from topmost to bottommost for accurate selection
  for (let i = inGameItems.length - 1; i >= 0; i--) {
    const item = inGameItems[i];

    // Skip if the item is out of range
    if (!isItemInRangeOfPlayer(item)) continue;

    // Check hover state
    if (isCursorOverItem(item, offsetX, offsetY)) {
      item.hover = true;
      canvas.style.cursor = "grab";
      hoverDetected = true;
      break; // Stop after the first hovered item (topmost)
    }
  }

  return hoverDetected;
};

// Reset Item Position
const resetItemPosition = (item, inGameItems) => {
  if (!item) return;

  item.drawPosition.x = item.lastValidPosition.x;
  item.drawPosition.y = item.lastValidPosition.y;
  item.held = false;
  item.hover = false;

  const index = inGameItems.findIndex(curr => curr.id === item.id);

  if (index > -1) {
    inGameItems.splice(index, 1);
    inGameItems.push(item);
  }
};

export { generateHexId, isCursorOverItem, clearHoverStates, updateItemHoverState, resetItemPosition }