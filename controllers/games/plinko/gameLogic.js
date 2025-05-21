/**
 * Calculate the result of a Plinko game
 * @param {string} hash - The game hash
 * @param {string} risk - The risk level (low, medium, high)
 * @param {number} rows - Number of rows in the Plinko board
 * @param {number} pins - Number of pins per row
 * @param {number[]} multipliers - Array of possible multipliers
 * @returns {Object} The game result including path and multiplier
 */
const calculatePlinkoResult = (hash, riskLevel, rows, pins, multipliers) => {
  try {
    // Validate inputs
    if (!hash) throw new Error('Hash is required');
    if (!riskLevel) throw new Error('Risk level is required');
    if (!rows || rows < 8 || rows > 16) throw new Error('Invalid rows (must be between 8 and 16)');
    if (!pins || pins <= 0) throw new Error('Invalid pins');
    if (!multipliers || !Array.isArray(multipliers) || multipliers.length === 0) {
      console.error('Invalid multipliers:', multipliers);
      throw new Error('Invalid multipliers configuration');
    }
    
    // Generate path using the hash
    const path = [];
    for (let i = 0; i < rows; i++) {
      // Use a portion of the hash to determine direction at each row
      const byte = parseInt(hash.substr(i * 2, 2), 16);
      // 0 = left, 1 = right
      path.push(byte % 2);
    }
    
    // Calculate final position
    let position = 0;
    for (let direction of path) {
      position += direction;
    }
    
    // Map position to multiplier
    // Scale the position to match the multipliers array length
    const scaledPosition = Math.floor(position * multipliers.length / (rows + 1));
    const finalPosition = Math.min(scaledPosition, multipliers.length - 1);
    
    const multiplier = multipliers[finalPosition];
    
    // Validate the multiplier
    if (typeof multiplier !== 'number' || isNaN(multiplier)) {
      console.error('Invalid multiplier at position:', finalPosition, 'multiplier:', multiplier);
      throw new Error('Invalid multiplier value');
    }
    
    console.log('Calculated Plinko result:', {
      riskLevel,
      rows,
      path,
      position,
      finalPosition,
      multiplier
    });
    
    return {
      path,
      position: finalPosition,
      multiplier
    };
  } catch (error) {
    console.error('Error calculating Plinko result:', error);
    throw error;
  }
};

/**
 * Calculate the path through the Plinko pins
 * @param {number} seed - A normalized value between 0 and 1
 * @param {number} rows - Number of rows in the Plinko board
 * @returns {number[]} Array representing the path (position at each row)
 */
function calculatePath(seed, rows) {
  const path = [0]; // Start at the top center
  let position = 0;
  
  // Use the seed to determine the path through each row
  for (let i = 0; i < rows; i++) {
    // Use a different part of the seed for each row decision
    const rowSeed = (seed + (i / rows)) % 1;
    
    // 50/50 chance to go left or right
    const direction = rowSeed < 0.5 ? -1 : 1;
    position += direction;
    
    // Ensure position stays within bounds (can't go off the board)
    position = Math.max(position, -i - 1);
    position = Math.min(position, i + 1);
    
    path.push(position + i + 1); // Adjust position to be 0-indexed for the row
  }
  
  return path;
}

module.exports = {
  calculatePlinkoResult,
  calculatePath
};