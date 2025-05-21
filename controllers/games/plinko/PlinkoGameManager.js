/**
 * Manages the state of Plinko games for all users
 */
class PlinkoGameManager {
  constructor() {
    this.clientSeeds = new Map();
    this.activeGames = new Map();
  }
  
  /**
   * Update a user's client seed
   * @param {string} userId - The user's ID
   * @param {string} clientSeed - The new client seed
   */
  updateClientSeed(userId, clientSeed) {
    this.clientSeeds.set(userId, clientSeed);
    return clientSeed;
  }
  
  /**
   * Get a user's client seed or generate a default one
   * @param {string} userId - The user's ID
   * @returns {string} The client seed
   */
  getClientSeed(userId) {
    if (!this.clientSeeds.has(userId)) {
      const defaultSeed = Math.random().toString(36).substring(2, 15);
      this.clientSeeds.set(userId, defaultSeed);
    }
    return this.clientSeeds.get(userId);
  }
  
  /**
   * Start a new game for a user
   * @param {string} userId - The user's ID
   * @param {Object} gameData - Initial game data
   * @returns {Object} The game data
   */
  startGame(userId, gameData) {
    this.activeGames.set(userId, gameData);
    return gameData;
  }
  
  /**
   * End a game for a user
   * @param {string} userId - The user's ID
   * @returns {boolean} Whether the game was successfully ended
   */
  endGame(userId) {
    return this.activeGames.delete(userId);
  }
  
  /**
   * Get a user's active game
   * @param {string} userId - The user's ID
   * @returns {Object|null} The game data or null if no active game
   */
  getActiveGame(userId) {
    return this.activeGames.get(userId) || null;
  }
}

module.exports = PlinkoGameManager;