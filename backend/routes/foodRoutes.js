const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/FoodController');
const { authenticateToken } = require('../middlewares/auth');

// ==================== FOOD POSTING ====================

/**
 * POST /api/food
 * Restaurant posts excess food
 * 
 * Request body:
 * {
 *   food_name: string,
 *   food_type: enum (meals|vegetables|baked|dairy|fruits|others),
 *   quantity_servings: number,
 *   description: text,
 *   latitude: number,
 *   longitude: number,
 *   address: string,
 *   safety_window_minutes: number (default 30),
 *   photo_url: string (optional)
 * }
 */
router.post('/', authenticateToken, FoodController.postFood);

/**
 * GET /api/food/my-posts
 * Get all posts by logged-in restaurant
 * 
 * Query params:
 * - status: POSTED|MATCHED|ACCEPTED|PICKED_UP|DELIVERED|EXPIRED
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
router.get('/my-posts', authenticateToken, FoodController.getMyPosts);

/**
 * GET /api/food/:id
 * Get detailed food post with urgency and timestamps
 * 
 * Response includes:
 * - urgency_score: 0-100
 * - status: enum
 * - All timestamps (posted_at, matched_at, etc.)
 * - freshness_score: 0-1
 */
router.get('/:id', FoodController.getFoodPost);

/**
 * GET /api/food/available
 * Get available food for NGOs (excluding EXPIRED/DELIVERED)
 * 
 * Query params:
 * - latitude: number
 * - longitude: number
 * - radius_km: number (default 5)
 * - food_type: enum (optional filter)
 * - min_urgency: number 0-100 (optional)
 * - max_urgency: number 0-100 (optional)
 * - limit: number (default 50)
 */
router.get('/available/all', FoodController.getAvailableFood);

/**
 * PUT /api/food/:id
 * Update food post (before MATCHED status)
 */
router.put('/:id', authenticateToken, FoodController.updateFoodPost);

/**
 * DELETE /api/food/:id
 * Cancel/delete food post (only before MATCHED)
 */
router.delete('/:id', authenticateToken, FoodController.deleteFoodPost);

module.exports = router;
