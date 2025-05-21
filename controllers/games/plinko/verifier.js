const { generateHash } = require('./seedGenerator');
const { calculatePlinkoResult } = require('./gameLogic');
const config = require('../../../config/gameConfig').plinko;

/**
 * Verify a game result is valid and matches the provided seeds
 * @param {string} serverSeed - The server seed
 * @param {string} clientSeed - The client seed
 * @param {number} nonce - The nonce value
 * @param {string} risk - The risk level
 * @param {Object} result - The result to verify
 * @returns {boolean} Whether the result is valid
 */
function verifyGameResult(serverSeed, clientSeed, nonce, risk, result) {
  try {
    // Generate the hash from the seeds
    const hash = generateHash(serverSeed, clientSeed, nonce);
    
    // Calculate the expected result
    const expectedResult = calculatePlinkoResult(
      hash,
      risk,
      config.rows,
      config.pins,
      config.multipliers[risk]
    );
    
    // Compare the path and multiplier
    const pathMatches = JSON.stringify(expectedResult.path) === JSON.stringify(result.path);
    const multiplierMatches = expectedResult.multiplier === result.multiplier;
    
    return pathMatches && multiplierMatches;
  } catch (error) {
    console.error('Error verifying game result:', error);
    return false;
  }
}

/**
 * Verify a hash matches the server seed
 * @param {string} serverSeed - The server seed
 * @param {string} clientSeed - The client seed
 * @param {number} nonce - The nonce value
 * @param {string} hash - The hash to verify
 * @returns {boolean} Whether the hash is valid
 */
function verifyHash(serverSeed, clientSeed, nonce, hash) {
  try {
    const expectedHash = generateHash(serverSeed, clientSeed, nonce);
    return expectedHash === hash;
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}

module.exports = {
  verifyGameResult,
  verifyHash
};