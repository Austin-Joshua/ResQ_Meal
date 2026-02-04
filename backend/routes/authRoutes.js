const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Request: { name, email, password, role: 'restaurant'|'ngo'|'volunteer', phone_number?, address?, latitude?, longitude? }
 * Passwords are hashed with bcrypt before storage.
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Request: { email, password }
 * Response: { success, data: { id, name, email, role, token } }
 * Passwords verified with bcrypt; JWT returned on success.
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Client-side token removal (no backend state needed for JWT)
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;
