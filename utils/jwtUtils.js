const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token that never expires.
 * @param {Object} payload - The payload to sign.
 * @param {string} secret - The JWT secret key.
 * @returns {string} - The signed JWT token.
 */
function generateNeverExpiringToken(payload, secret) {
  // No expiresIn option means token does not expire
  return jwt.sign(payload, secret);
}

module.exports = {
  generateNeverExpiringToken,
};
