const jwt = require('jsonwebtoken');

// Use same secret as jwt.js so tokens signed at login verify correctly (fallback when JWT_SECRET not in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

/**
 * Middleware to authenticate JWT token
 * Expects: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
