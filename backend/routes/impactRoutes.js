const express = require('express');
const router = express.Router();
const ImpactController = require('../controllers/ImpactController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * GET /api/impact/ngo
 * Get impact metrics for logged-in NGO
 * 
 * Query:
 * - period: today|week|month|all (default: all)
 */
router.get('/ngo', authenticateToken, ImpactController.getNGOImpact);

/**
 * GET /api/impact/restaurant
 * Get impact metrics for logged-in restaurant
 * 
 * Query:
 * - period: today|week|month|all (default: all)
 */
router.get('/restaurant', authenticateToken, ImpactController.getRestaurantImpact);

/**
 * GET /api/impact/global
 * Get global impact metrics (public)
 */
router.get('/global', ImpactController.getGlobalImpact);

/**
 * GET /api/impact/timeline
 * Get impact timeline for dashboard visualization
 * 
 * Query:
 * - days: number (default: 7)
 */
router.get('/timeline', ImpactController.getImpactTimeline);

module.exports = router;
