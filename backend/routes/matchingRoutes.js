const express = require('express');
const router = express.Router();
const MatchingController = require('../controllers/MatchingController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * POST /api/matches
 * NGO requests a food post
 * 
 * Request:
 * {
 *   food_post_id: number
 * }
 */
router.post('/', authenticateToken, MatchingController.createMatch);

/**
 * GET /api/matches/for-ngo
 * Get all matches for logged-in NGO
 * 
 * Query:
 * - status: MATCHED|ACCEPTED|PICKED_UP|DELIVERED (optional)
 * - limit: number
 * - offset: number
 */
router.get('/for-ngo/all', authenticateToken, MatchingController.getMatchesForNGO);

/**
 * GET /api/matches/for-restaurant
 * Get all matches for logged-in restaurant
 */
router.get('/for-restaurant/all', authenticateToken, MatchingController.getMatchesForRestaurant);

/**
 * GET /api/matches/:id
 * Get match details with timeline
 */
router.get('/:id', MatchingController.getMatch);

/**
 * PUT /api/matches/:id/status
 * Update match status (MATCHED -> ACCEPTED -> PICKED_UP -> DELIVERED)
 * 
 * Request:
 * {
 *   status: ACCEPTED|PICKED_UP|DELIVERED,
 *   volunteer_id: number (for PICKED_UP),
 *   delivery_proof_photo: string (for DELIVERED)
 * }
 */
router.put('/:id/status', authenticateToken, MatchingController.updateMatchStatus);

/**
 * PUT /api/matches/:id/assign-volunteer
 * Assign volunteer for pickup
 * 
 * Request:
 * {
 *   volunteer_id: number
 * }
 */
router.put('/:id/assign-volunteer', authenticateToken, MatchingController.assignVolunteer);

module.exports = router;
