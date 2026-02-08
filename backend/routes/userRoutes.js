const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const userController = require('../controllers/userController');

/**
 * GET /api/users/me
 * Get logged-in user profile
 */
router.get('/me', authenticateToken, userController.getCurrentUser);

/**
 * PUT /api/users/me
 * Update logged-in user profile
 * Request: { name?, phone_number?, address?, latitude?, longitude?, current_password?, new_password? }
 */
router.put('/me', authenticateToken, userController.updateCurrentUser);

module.exports = router;
