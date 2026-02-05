const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const OrganisationFoodController = require('../controllers/organisationFoodController');

/**
 * POST /api/organisation/food
 * Organisation (NGO) adds food – reflected on volunteer page.
 */
router.post('/food', authenticateToken, OrganisationFoodController.postFood);

/**
 * GET /api/organisation/food
 * List food posted by the current organisation.
 */
router.get('/food', authenticateToken, OrganisationFoodController.getMyOrganisationFood);

/**
 * GET /api/organisation/food/available
 * List all available (PENDING) organisation food – for volunteers.
 */
router.get('/food/available', authenticateToken, OrganisationFoodController.getAvailableOrganisationFood);

module.exports = router;
