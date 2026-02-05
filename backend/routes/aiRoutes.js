const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * GET /api/ai/demand-prediction
 * Returns predicted demand per NGO (for smart matching).
 */
router.get('/demand-prediction', authenticateToken, aiController.getDemandPrediction);

/**
 * POST /api/ai/feedback
 * Record match outcome for learning (accepted, rejected, delivered).
 * Body: { match_id, outcome, delay_minutes?, notes? }
 */
router.post('/feedback', authenticateToken, aiController.postFeedback);

/**
 * GET /api/ai/health
 * Which AI features are enabled (freshness URLs, etc.).
 */
router.get('/health', aiController.getAiHealth);

module.exports = router;
