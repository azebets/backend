const crypto = require('crypto');

/**
 * Generate a random server seed
 * @returns {string} A random hex string
 */
function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a hash from server seed, client seed, and nonce
 * @param {string} serverSeed - The server seed
 * @param {string} clientSeed - The client seed
 * @param {number} nonce - The nonce value
 * @param {string} [salt='plinko-salt'] - Optional salt value
 * @returns {string} The resulting hash
 */
function generateHash(serverSeed, clientSeed, nonce, salt = 'plinko-salt') {
  const dataToHash = `${serverSeed}:${clientSeed}:${nonce}:${salt}`;
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Generate a HMAC for a specific game round
 * @param {string} serverSeed - The server seed
 * @param {string} clientSeed - The client seed
 * @param {number} nonce - The nonce value
 * @returns {string} The HMAC result
 */
function generateHmac(serverSeed, clientSeed, nonce) {
  return crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');
}

module.exports = {
  generateServerSeed,
  generateHash,
  generateHmac
};