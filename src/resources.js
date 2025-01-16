const BASE_URL = './backend/assets/';

class Resources {
  constructor() {
    this.mapJsonToLoad = {
      genus01: 'map_data/map_genus_01.json',
    };

    this.mapData = {};
    this.playerData = {};
    // this.itemData = {};

    this.loadData();
  };

  async fetchJson(url) {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Fetch error for ${url}`);
    };
    return response.json();
  };

  async loadData() {
    try {
      await Promise.all([
        this.loadMapData(),
        this.loadPlayerData(),
        // this.loadItemData()
      ]);
      console.log('All data loaded successfully.');
    } catch (error) {
      console.error('Error loading data:', error);
    };
  };

  async loadMapData() {
    const mapPromises = Object.keys(this.mapJsonToLoad).map(async (key) => {
      const data = await this.fetchJson(this.mapJsonToLoad[key]);
      this.mapData[key] = data;
    });

    await Promise.all(mapPromises);
    this.mapData.isLoaded = true;
  };

  async loadPlayerData() {
    this.playerData = await this.fetchJson('player_data/player.json');
    this.playerData.isLoaded = true;
  };

  playerExists(playername) {
    return this.playerData.playerlist.some(player => player.name === playername);
  };

  createPlayer(playername) {
    if (this.playerExists(playername)) {
      console.log(`Logged in as ${playername}.`);
      const returningPlayer = this.playerData.playerlist.find(player => player.name === playername);
      return returningPlayer;
    };;

    const newPlayer = {
      id: this.playerData.playerlist.length + 1,
      name: playername,
      details: this.playerData.newplayer
    };

    this.playerData.playerlist.push(newPlayer);
    console.log(`New player ${playername} added.`);
    return newPlayer;
  };

  // async loadItemData() {
  //   this.itemData = await this.fetchJson('item_data/items.json');
  //   this.itemData.isLoaded = true;
  // };
};

export const resources = new Resources();