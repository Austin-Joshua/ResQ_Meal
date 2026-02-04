const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

/**
 * GET /api/users/me
 * Get logged-in user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  // TODO: Fetch user profile from database
  res.json({ message: 'Get user profile endpoint' });
});

/**
 * PUT /api/users/me
 * Update logged-in user profile
 * 
 * Request:
 * {
 *   name: string,
 *   phone_number: string,
 *   latitude: number,
 *   longitude: number,
 *   profile_photo: string (file path)
 * }
 */
router.put('/me', authenticateToken, (req, res) => {
  // TODO: Update user profile
  res.json({ message: 'Update user profile endpoint' });
});

module.exports = router;
