require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const SALT_ROUNDS = 10;

module.exports = {
  /**
   * Generate JWT token
   * @param {Object} payload - Data to include in token
   * @returns {String} JWT token
   */
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  },

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

  /**
   * Hash password using bcrypt
   * @param {String} password - Plain text password
   * @returns {String} Hashed password
   */
  hashPassword: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Compare password with hash
   * @param {String} password - Plain text password
   * @param {String} hash - Hashed password
   * @returns {Boolean} True if password matches hash
   */
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  // Configuration constants
    secret: JWT_SECRET,        
  JWT_SECRET,
  JWT_EXPIRES_IN,
  SALT_ROUNDS
};