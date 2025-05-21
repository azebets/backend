const PlinkoGame = require('../../../models/games/plinko/plinkoGame');
const User = require('../../../models/user.model');
const Bills = require('../../../models/bill');

/**
 * Updates a user's balance
 * @param {string} userId - The user ID
 * @param {number} amount - The amount to add (positive) or subtract (negative)
 */
const updateUserBalance = async (userId, amount) => {
  await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: amount } }
  );
};

/**
 * Creates a bill record for the transaction
 * @param {Object} gameRecord - The game record
 */
const createBillRecord = async (gameRecord) => {
  const isWin = gameRecord.payout > gameRecord.bet_amount;
  
  await Bills.create({
    user_id: gameRecord.user_id,
    transaction_type: isWin ? "Plinko Win" : "Plinko Bet",
    token_img: "/assets/token/usdt.png", // Default token image
    token_name: "USDT", // Default token name
    balance: gameRecord.bet_amount,
    trx_amount: isWin ? gameRecord.payout - gameRecord.bet_amount : -gameRecord.bet_amount,
    datetime: gameRecord.created_at,
    status: isWin,
    bill_id: `plinko-${gameRecord._id}`
  });
};

/**
 * Handle a Plinko bet
 * @param {Object} betData - The bet data
 * @returns {Promise<Object>} The bet result
 */
const handleBet = async (betData) => {
  try {
    // Validate required fields
    if (!betData.userId) throw new Error('User ID is required');
    if (typeof betData.amount !== 'number' || betData.amount <= 0) throw new Error('Invalid bet amount');
    if (!betData.risk_level) throw new Error('Risk level is required');
    if (!betData.client_seed) throw new Error('Client seed is required');
    if (!betData.server_seed) throw new Error('Server seed is required');
    if (typeof betData.nonce !== 'number') throw new Error('Invalid nonce');
    if (!betData.hash) throw new Error('Hash is required');
    if (!Array.isArray(betData.path)) throw new Error('Path is required');
    if (typeof betData.multiplier !== 'number' || isNaN(betData.multiplier)) throw new Error('Invalid multiplier');
    if (typeof betData.payout !== 'number' || isNaN(betData.payout)) throw new Error('Invalid payout');
    
    console.log('Processing bet with data:', {
      userId: betData.userId,
      amount: betData.amount,
      risk_level: betData.risk_level,
      multiplier: betData.multiplier,
      payout: betData.payout
    });
    
    // Check user balance
    const user = await User.findById(betData.userId);
    if (!user) throw new Error('User not found');
    if (user.balance < betData.amount) throw new Error('Insufficient balance');
    
    // Deduct bet amount from user balance
    await updateUserBalance(betData.userId, -betData.amount);
    
    // Create game record
    const gameRecord = await PlinkoGame.create({
      user_id: betData.userId,
      bet_amount: betData.amount,
      risk_level: betData.risk_level,
      client_seed: betData.client_seed,
      server_seed: betData.server_seed,
      nonce: betData.nonce,
      hash: betData.hash,
      path: betData.path,
      multiplier: betData.multiplier,
      payout: betData.payout
    });
    
    // Add winnings to user balance
    await updateUserBalance(betData.userId, betData.payout);
    
    // Create bill record for the transaction
    await createBillRecord(gameRecord);
    
    // Return bet result
    return {
      id: gameRecord._id,
      userId: betData.userId,
      amount: betData.amount,
      risk_level: betData.risk_level,
      path: betData.path,
      multiplier: betData.multiplier,
      payout: betData.payout,
      profit: betData.payout - betData.amount,
      timestamp: gameRecord.created_at
    };
  } catch (error) {
    console.error('Error processing bet:', error);
    throw error;
  }
};

/**
 * Get recent Plinko bets
 * @param {number} [limit=50] - Maximum number of bets to return
 * @returns {Promise<Array>} Recent bets
 */
async function getRecentBets(limit = 50) {
  try {
    // Find the most recent games
    const games = await PlinkoGame.find()
      .sort({ created_at: -1 })
      .limit(limit);
    
    // Get user information for each game
    const betsWithUserInfo = await Promise.all(
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
          timestamp: game.created_at
        };
      })
    );
    
    return betsWithUserInfo;
  } catch (error) {
    console.error('Error getting recent Plinko bets:', error);
    throw new Error('Failed to retrieve recent bets');
  }
}

/**
 * Get a user's bet history
 * @param {string} userId - The user's ID
 * @param {number} [limit=50] - Maximum number of bets to return
 * @returns {Promise<Array>} User's bet history
 */
async function getUserBetHistory(userId, limit = 50) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const games = await PlinkoGame.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(limit);
    
    return games.map(game => ({
      id: game._id,
      amount: game.bet_amount,
      risk: game.risk_level,
      path: game.path,
      multiplier: game.multiplier,
      payout: game.payout,
      profit: game.payout - game.bet_amount,
      timestamp: game.created_at,
      verificationData: {
        serverSeed: game.server_seed,
        clientSeed: game.client_seed,
        nonce: game.nonce,
        hash: game.hash
      }
    }));
  } catch (error) {
    console.error('Error getting user bet history:', error);
    throw new Error('Failed to retrieve bet history');
  }
}

/**
 * Get statistics for a user's Plinko bets
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} User's bet statistics
 */
async function getUserBetStats(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const games = await PlinkoGame.find({ user_id: userId });
    
    if (games.length === 0) {
      return {
        totalBets: 0,
        totalWagered: 0,
        totalPayout: 0,
        netProfit: 0,
        highestMultiplier: 0,
        highestPayout: 0,
        averageMultiplier: 0
      };
    }
    
    const totalBets = games.length;
    const totalWagered = games.reduce((sum, game) => sum + game.bet_amount, 0);
    const totalPayout = games.reduce((sum, game) => sum + game.payout, 0);
    const netProfit = totalPayout - totalWagered;
    const highestMultiplier = Math.max(...games.map(game => game.multiplier));
    const highestPayout = Math.max(...games.map(game => game.payout));
    const averageMultiplier = games.reduce((sum, game) => sum + game.multiplier, 0) / totalBets;
    
    return {
      totalBets,
      totalWagered,
      totalPayout,
      netProfit,
      highestMultiplier,
      highestPayout,
      averageMultiplier
    };
  } catch (error) {
    console.error('Error getting user bet stats:', error);
    throw new Error('Failed to retrieve bet statistics');
  }
}

module.exports = {
  handleBet,
  getRecentBets,
  getUserBetHistory,
  getUserBetStats
};