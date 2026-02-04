// JWT utility functions (uses jsonwebtoken for compatibility with auth middleware)
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

/**
 * Generate JWT token for authenticated user
 */
exports.generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * Decode and verify JWT token
 */
exports.decodeToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};
