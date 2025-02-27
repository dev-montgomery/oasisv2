const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public')); // Serve static assets
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const playerFilePath = path.join(__dirname, 'assets/player_data', 'player.json');
const itemsFilePath = path.join(__dirname, 'assets/item_data', 'items.json');

// Save Player Data
app.post('/savePlayerData', async (req, res) => {
  try {
    await fs.writeJson(playerFilePath, req.body, { spaces: 2 });
    res.status(200).json({ success: true, message: 'Player data saved successfully.' });
  } catch (error) {
    console.error('Error saving player data:', error);
    res.status(500).json({ success: false, message: 'Failed to save player data.' });
  }
});

// Save Item Data
app.post('/saveItemData', async (req, res) => {
  try {
    await fs.writeJson(itemsFilePath, req.body, { spaces: 2 });
    res.status(200).json({ success: true, message: 'Item data saved successfully.' });
  } catch (error) {
    console.error('Error saving item data:', error);
    res.status(500).json({ success: false, message: 'Failed to save item data.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\x1b[33m', `Server is running on port ${PORT}`, '\x1b[0m');
});