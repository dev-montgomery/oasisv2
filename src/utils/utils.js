const isMouseOverButton = ({ x, y }, width = 64, height = 64) => {
  return offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height;
};

const generateHexId = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const getMousePosition = (event) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export { isMouseOverButton, generateHexId, getMousePosition };