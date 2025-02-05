const BASE_URL = './backend/assets/';

class Resources {
  constructor() {
    this.mapJsonToLoad = {
      genus01: 'map_data/map_genus_01.json',
    };

    this.mapData = {};
    this.playerData = {}; // Stores player.json data
    this.itemData = {};   // Stores items.json data

    this.loadData();
  }

  async fetchJson(url) {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Fetch error for ${url}`);
    }
    return response.json();
  }

  async loadData() {
    try {
      await Promise.all([
        this.loadMapData(),
        this.loadPlayerData(),
        this.loadItemData()
      ]);
      console.log('All data loaded successfully.');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadMapData() {
    const mapPromises = Object.keys(this.mapJsonToLoad).map(async (key) => {
      const data = await this.fetchJson(this.mapJsonToLoad[key]);
      this.mapData[key] = data;
    });

    await Promise.all(mapPromises);
    this.mapData.isLoaded = true;
  }

  async loadPlayerData() {
    const data = await this.fetchJson('player_data/player.json');
    this.playerData = data; // No extra nesting!
    this.playerData.isLoaded = true;
    console.log('Player data loaded:', this.playerData);
  }

  async loadItemData() {
    const data = await this.fetchJson('item_data/items.json');
    this.itemData = data; // No extra nesting!
    this.itemData.isLoaded = true;
    console.log('Item data loaded:', this.itemData);
  }

  playerExists(playername) {
    return this.playerData.playerlist.some(player => player.name === playername);
  }

  createPlayer(playername) {
    if (this.playerData.playerlist.length === 0) this.playerData.playerlist = [];

    if (this.playerExists(playername)) {
      console.log(`Logged in as ${playername}.`);
      return this.playerData.playerlist.find(player => player.name === playername);
    }

    const newPlayer = {
      id: this.playerData.playerlist.length + 1,
      name: playername,
      details: { ...this.playerData.newplayer }
    };

    this.playerData.playerlist.push(newPlayer);
    console.log(`New player ${playername} added.`);
    return newPlayer;
  }
}

export const resources = new Resources();