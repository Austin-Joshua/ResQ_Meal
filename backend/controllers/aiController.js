/**
 * AI Controller: demand prediction, feedback for learning, and AI health.
 * Implements the AI layers described in docs/AI_IMPLEMENTATION.md.
 */

const pool = require('../config/database');

/**
 * GET /api/ai/demand-prediction
 * Returns predicted food demand per NGO (for use in smart matching).
 * Uses historical match/delivery data when available; falls back to rule-based (capacity, need level).
 */
async function getDemandPrediction(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      // Aggregate: past deliveries and accepted matches per NGO (last 30 days)
      const [rows] = await connection.query(
        `SELECT n.id AS ngo_id, n.organization_name, n.daily_capacity,
                n.used_capacity,
                COUNT(DISTINCT m.id) AS accepted_count,
                COUNT(DISTINCT CASE WHEN m.status = 'DELIVERED' THEN m.id END) AS delivered_count
         FROM ngos n
         LEFT JOIN matches m ON m.ngo_id = n.id
           AND m.status IN ('ACCEPTED', 'PICKED_UP', 'DELIVERED')
           AND m.matched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         WHERE n.verified = 1
         GROUP BY n.id, n.organization_name, n.daily_capacity, n.used_capacity`
      );

      const dayOfWeek = new Date().getDay();
      const predictions = rows.map((r) => {
        const capacity = Number(r.daily_capacity) || 100;
        const used = Number(r.used_capacity) || 0;
        const accepted = Number(r.accepted_count) || 0;
        const delivered = Number(r.delivered_count) || 0;
        // Predicted demand: blend of (capacity - used) and recent acceptance rate
        const recentDemand = accepted + delivered;
        const predictedServings = Math.round(
          (capacity - used) * 0.6 + Math.min(recentDemand * 2, capacity) * 0.4
        );
        const demandLevel =
          predictedServings >= capacity * 0.8 ? 'critical' : predictedServings >= capacity * 0.5 ? 'high' : 'normal';
        return {
          ngo_id: r.ngo_id,
          organization_name: r.organization_name,
          predicted_demand_servings: Math.max(0, predictedServings),
          demand_level: demandLevel,
          day_of_week: dayOfWeek,
          accepted_last_30d: accepted,
          delivered_last_30d: delivered,
        };
      });

      res.json({ data: predictions });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Demand prediction error:', err);
    res.status(500).json({ error: 'Failed to compute demand prediction' });
  }
}

/**
 * POST /api/ai/feedback
 * Record match outcome for learning (accepted, rejected, delivered, delay).
 * Body: { match_id, outcome: 'accepted'|'rejected'|'delivered', delay_minutes?, notes? }
 */
async function postFeedback(req, res) {
  try {
    const { match_id, outcome, delay_minutes, notes } = req.body;
    if (!match_id || !outcome) {
      return res.status(400).json({ error: 'match_id and outcome required' });
    }
    const validOutcomes = ['accepted', 'rejected', 'delivered'];
    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({ error: 'outcome must be one of: accepted, rejected, delivered' });
    }

    const connection = await pool.getConnection();
    try {
      const [matches] = await connection.query('SELECT id, ngo_id, food_post_id FROM matches WHERE id = ?', [
        match_id,
      ]);
      if (matches.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Store feedback (table ai_feedback if exists; else we only log for now)
      await connection.query(
        `INSERT INTO ai_feedback (match_id, ngo_id, food_post_id, outcome, delay_minutes, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          match_id,
          matches[0].ngo_id,
          matches[0].food_post_id,
          outcome,
          delay_minutes != null ? delay_minutes : null,
          notes || null,
        ]
      );
      res.json({ success: true, message: 'Feedback recorded' });
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        // Table not created yet: still return success so clients can call; log for future retraining
        console.log('AI feedback (no table):', { match_id, outcome, delay_minutes, notes });
        return res.json({ success: true, message: 'Feedback recorded (logging only)' });
      }
      throw e;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
}

/**
 * GET /api/ai/health
 * Returns which AI features are available (freshness URLs, demand prediction, etc.).
 */
function getAiHealth(req, res) {
  const env = process.env;
  res.json({
    freshness_image: !!(env.FRESHNESS_AI_URL || env.FRESHNESS_TFLITE_URL || env.FRESHNESS_FRESHVISION_URL || env.FRESHNESS_ROBOFLOW_URL),
    freshness_env: !!env.FRESHNESS_ENV_AI_URL,
    demand_prediction: true,
    feedback_enabled: true,
  });
}

module.exports = {
  getDemandPrediction,
  postFeedback,
  getAiHealth,
};
