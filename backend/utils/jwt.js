/**
 * JWT utility functions for token generation and verification
 */
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object to encode in the token
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  if (!process.env.SESSION_SECRET) {
    console.error('WARNING: SESSION_SECRET environment variable is not set!');
    console.error('Please set SESSION_SECRET in your .env file');
  }

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'User',
      isGuest: user.isGuest || false
    },
    process.env.SESSION_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    if (!process.env.SESSION_SECRET) {
      console.error('WARNING: SESSION_SECRET environment variable is not set!');
      console.error('Please set SESSION_SECRET in your .env file');
      return null;
    }

    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
