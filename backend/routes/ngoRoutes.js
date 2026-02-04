const express = require('express');
const router = express.Router();
const NGOController = require('../controllers/NGOController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * GET /api/ngos/:id
 * Get NGO details including capacity metrics
 */
router.get('/:id', NGOController.getNGO);

/**
 * PUT /api/ngos/:id
 * Update NGO profile (authenticated)
 */
router.put('/:id', authenticateToken, NGOController.updateNGO);

/**
 * GET /api/ngos/:id/capacity
 * Get NGO capacity utilization
 * 
 * Response:
 * {
 *   daily_capacity: number,
 *   used_capacity: number,
 *   remaining_capacity: number,
 *   utilization_percent: number
 * }
 */
router.get('/:id/capacity', NGOController.getNGOCapacity);

/**
 * POST /api/ngos/:id/capacity/update
 * Update NGO capacity (internal use)
 */
router.post('/:id/capacity/update', authenticateToken, NGOController.updateCapacity);

module.exports = router;
