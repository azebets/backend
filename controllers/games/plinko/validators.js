/**
 * Validate bet data
 * @param {Object} betData - The bet data to validate
 * @returns {string|null} Error message or null if valid
 */
function validateBet(betData) {
  const { userId, amount, risk, clientSeed, nonce } = betData;
  
  if (!userId) {
    return 'User ID is required';
  }
  
  if (amount === undefined || amount === null) {
    return 'Bet amount is required';
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Bet amount must be a number';
  }
  
  if (amount <= 0) {
    return 'Bet amount must be greater than 0';
  }
  
  if (!risk) {
    return 'Risk level is required';
  }
  
  if (!['low', 'medium', 'high'].includes(risk)) {
    return 'Invalid risk level. Must be low, medium, or high';
  }
  
  if (!clientSeed) {
    return 'Client seed is required';
  }
  
  if (typeof clientSeed !== 'string') {
    return 'Client seed must be a string';
  }
  
  if (clientSeed.length < 1 || clientSeed.length > 64) {
    return 'Client seed must be between 1 and 64 characters';
  }
  
  if (nonce === undefined || nonce === null) {
    return 'Nonce is required';
  }
  
  if (typeof nonce !== 'number' || isNaN(nonce) || nonce < 0 || !Number.isInteger(nonce)) {
    return 'Nonce must be a non-negative integer';
  }
  
  return null; // No validation errors
}

/**
 * Validate client seed
 * @param {string} clientSeed - The client seed to validate
 * @returns {string|null} Error message or null if valid
 */
function validateClientSeed(clientSeed) {
  if (!clientSeed) {
    return 'Client seed is required';
  }
  
  if (typeof clientSeed !== 'string') {
    return 'Client seed must be a string';
  }
  
  if (clientSeed.length < 1 || clientSeed.length > 64) {
    return 'Client seed must be between 1 and 64 characters';
  }
  
  return null; // No validation errors
}

/**
 * Validate verification data
 * @param {Object} verificationData - The verification data to validate
 * @returns {string|null} Error message or null if valid
 */
function validateVerificationData(verificationData) {
  const { serverSeed, clientSeed, nonce, risk } = verificationData;
  
  if (!serverSeed) {
    return 'Server seed is required';
  }
  
  if (typeof serverSeed !== 'string') {
    return 'Server seed must be a string';
  }
  
  if (serverSeed.length !== 64) {
    return 'Server seed must be 64 characters (32 bytes in hex)';
  }
  
  const clientSeedError = validateClientSeed(clientSeed);
  if (clientSeedError) {
    return clientSeedError;
  }
  
  if (nonce === undefined || nonce === null) {
    return 'Nonce is required';
  }
  
  if (typeof nonce !== 'number' || isNaN(nonce) || nonce < 0 || !Number.isInteger(nonce)) {
    return 'Nonce must be a non-negative integer';
  }
  
  if (!risk) {
    return 'Risk level is required';
  }
  
  if (!['low', 'medium', 'high'].includes(risk)) {
    return 'Invalid risk level. Must be low, medium, or high';
  }
  
  return null; // No validation errors
}

/**
 * Validate user balance against bet amount
 * @param {number} balance - The user's current balance
 * @param {number} betAmount - The bet amount
 * @returns {string|null} Error message or null if valid
 */
function validateBalance(balance, betAmount) {
  if (balance === undefined || balance === null) {
    return 'User balance is required';
  }
  
  if (typeof balance !== 'number' || isNaN(balance)) {
    return 'User balance must be a number';
  }
  
  if (betAmount === undefined || betAmount === null) {
    return 'Bet amount is required';
  }
  
  if (typeof betAmount !== 'number' || isNaN(betAmount)) {
    return 'Bet amount must be a number';
  }
  
  if (betAmount <= 0) {
    return 'Bet amount must be greater than 0';
  }
  
  if (balance < betAmount) {
    return 'Insufficient balance';
  }
  
  return null; // No validation errors
}

module.exports = {
  validateBet,
  validateClientSeed,
  validateVerificationData,
  validateBalance
};