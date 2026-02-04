// JWT utility functions
const jwtSimple = require('jwt-simple');

const secret = process.env.JWT_SECRET || 'default-secret-key';

/**
 * Generate JWT token for authenticated user
 */
exports.generateToken = (userId, role) => {
  const payload = {
    id: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  return jwtSimple.encode(payload, secret);
};

/**
 * Decode and verify JWT token
 */
exports.decodeToken = (token) => {
  try {
    return jwtSimple.decode(token, secret);
  } catch (err) {
    return null;
  }
};
