const PlinkoGame = require('../../../models/games/plinko/plinkoGame');
const User = require('../../../models/user.model');

/**
 * Create a new game record
 * @param {Object} gameData - The game data
 * @returns {Promise<Object>} The created game record
 */
async function createGameRecord(gameData) {
  try {
    const game = new PlinkoGame(gameData);
    await game.save();
    return game;
  } catch (error) {
    console.error('Error creating game record:', error);
    throw new Error('Failed to create game record');
  }
}

/**
 * Get game history for a user or all users
 * @param {string} [userId] - Optional user ID to filter by
 * @param {number} [limit=50] - Maximum number of records to return
 * @returns {Promise<Array>} Game history records
 */
async function getGameHistory(userId, limit = 50) {
  try {
    let query = {};
    
    if (userId) {
      query.user_id = userId;
    }
    
    const games = await PlinkoGame.find(query)
      .sort({ created_at: -1 })
      .limit(limit);
    
    // Get user information for each game
    const historyWithUserInfo = await Promise.all(
      games.map(async (game) => {
        const user = await User.findById(game.user_id).select('username avatar hiddenFromPublic');
        
        if (!user) {
          return {
            id: game._id,
            userId: game.user_id,
            username: 'Unknown',
            avatar: '/assets/avatars/default.png',
            hidden: true,
            amount: game.bet_amount,
            risk: game.risk_level,
            path: game.path,
            multiplier: game.multiplier,
            payout: game.payout,
            profit: game.payout - game.bet_amount,
            timestamp: game.created_at
          };
        }
        
        return {
          id: game._id,
          userId: game.user_id,
          username: user.hiddenFromPublic ? 'Hidden' : user.username,
          avatar: user.avatar || '/assets/avatars/default.png',
          hidden: user.hiddenFromPublic,
          amount: game.bet_amount,
          risk: game.risk_level,
          path: game.path,
          multiplier: game.multiplier,
          payout: game.payout,
          profit: game.payout - game.bet_amount,
          timestamp: game.created_at
        };
      })
    );
    
    return historyWithUserInfo;
  } catch (error) {
    console.error('Error getting game history:', error);
    throw new Error('Failed to retrieve game history');
  }
}

/**
 * Get high win games
 * @param {number} [limit=10] - Maximum number of records to return
 * @returns {Promise<Array>} High win game records
 */
async function getHighWinGames(limit = 10) {
  try {
    const games = await PlinkoGame.find()
      .sort({ multiplier: -1 })
      .limit(limit);
    
    // Get user information for each game
    const highWinsWithUserInfo = await Promise.all(
      games.map(async (game) => {
        const user = await User.findById(game.user_id).select('username avatar hiddenFromPublic');
        
        if (!user) {
          return {
            id: game._id,
            userId: game.user_id,
            username: 'Unknown',
            avatar: '/assets/avatars/default.png',
            hidden: true,
            amount: game.bet_amount,
            risk: game.risk_level,
            multiplier: game.multiplier,
            payout: game.payout,
            profit: game.payout - game.bet_amount,
            timestamp: game.created_at
          };
        }
        
        return {
          id: game._id,
          userId: game.user_id,
          username: user.hiddenFromPublic ? 'Hidden' : user.username,
          avatar: user.avatar || '/assets/avatars/default.png',
          hidden: user.hiddenFromPublic,
          amount: game.bet_amount,
          risk: game.risk_level,
          multiplier: game.multiplier,
          payout: game.payout,
          profit: game.payout - game.bet_amount,
          timestamp: game.created_at
        };
      })
    );
    
    return highWinsWithUserInfo;
  } catch (error) {
    console.error('Error getting high win games:', error);
    throw new Error('Failed to retrieve high win games');
  }
}

module.exports = {
  createGameRecord,
  getGameHistory,
  getHighWinGames
};