const { pool } = require('../server');

class MatchingController {
  
  /**
   * Calculate match score based on:
   * - Distance (closer = better)
   * - NGO capacity (available capacity = better)
   * - Food type preference
   */
  static calculateMatchScore(distanceKm, ngoCapacityPercent, foodType) {
    let score = 0.5;

    // Distance component (0.4)
    if (distanceKm <= 2) score += 0.35;
    else if (distanceKm <= 5) score += 0.25;
    else if (distanceKm <= 10) score += 0.15;
    else score += 0.05;

    // Capacity component (0.3)
    const capacityScore = ngoCapacityPercent / 100;
    score += capacityScore * 0.3;

    // Food type bonus (0.2) - high-demand types get boost
    const highDemand = ['meals', 'vegetables', 'baked'];
    if (highDemand.includes(foodType)) {
      score += 0.15;
    } else {
      score += 0.05;
    }

    return Math.min(1.0, score); // cap at 1.0
  }

  static formatMatchResponse(match) {
    return {
      id: match.id,
      food_post_id: match.food_post_id,
      ngo_id: match.ngo_id,
      volunteer_id: match.volunteer_id,
      status: match.status, // MATCHED|ACCEPTED|PICKED_UP|DELIVERED
      match_score: parseFloat(match.match_score),
      distance_km: parseFloat(match.distance_km),
      estimated_pickup_time_minutes: match.estimated_pickup_time_minutes,
      delivery_proof_photo: match.delivery_proof_photo,
      notes: match.notes,
      // Timeline support
      timestamps: {
        matched_at: match.matched_at,
        accepted_at: match.accepted_at,
        picked_up_at: match.picked_up_at,
        delivered_at: match.delivered_at,
      },
      created_at: match.created_at,
      updated_at: match.updated_at,
    };
  }

  /**
   * POST /api/matches
   * NGO creates a match request for a food post
   */
  static async createMatch(req, res) {
    try {
      const ngoId = req.user.id;
      const { food_post_id } = req.body;

      if (!food_post_id) {
        return res.status(400).json({ error: 'food_post_id required' });
      }

      const connection = await pool.getConnection();
      try {
        // Get food post
        const [foodPosts] = await connection.query(
          'SELECT * FROM food_posts WHERE id = ?',
          [food_post_id]
        );

        if (foodPosts.length === 0) {
          return res.status(404).json({ error: 'Food post not found' });
        }

        const foodPost = foodPosts[0];

        // Check if already matched
        if (foodPost.status !== 'POSTED') {
          return res.status(400).json({ error: 'Food already matched or not available' });
        }

        // Get NGO
        const [ngos] = await connection.query(
          'SELECT * FROM ngos WHERE id = ?',
          [ngoId]
        );

        if (ngos.length === 0) {
          return res.status(404).json({ error: 'NGO not found' });
        }

        const ngo = ngos[0];

        // Calculate match score
        const distanceKm = 2; // TODO: Implement haversine distance
        const capacityPercent = (ngo.remaining_capacity / ngo.daily_capacity) * 100;
        const matchScore = MatchingController.calculateMatchScore(
          distanceKm,
          capacityPercent,
          foodPost.food_type
        );

        // Create match
        const [result] = await connection.query(
          `INSERT INTO matches (
            food_post_id, ngo_id, status, match_score, distance_km,
            estimated_pickup_time_minutes, matched_at
          ) VALUES (?, ?, 'MATCHED', ?, ?, 30, NOW())`,
          [food_post_id, ngoId, matchScore, distanceKm]
        );

        // Update food post status to MATCHED
        await connection.query(
          `UPDATE food_posts SET status = 'MATCHED', matched_at = NOW() WHERE id = ?`,
          [food_post_id]
        );

        const [newMatch] = await connection.query(
          'SELECT * FROM matches WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json(MatchingController.formatMatchResponse(newMatch[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({ error: 'Failed to create match' });
    }
  }

  /**
   * GET /api/matches/for-ngo/all
   * Get all matches for NGO
   */
  static async getMatchesForNGO(req, res) {
    try {
      const ngoId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;

      let query = 'SELECT * FROM matches WHERE ngo_id = ?';
      const params = [ngoId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ` ORDER BY matched_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const connection = await pool.getConnection();
      try {
        const [matches] = await connection.query(query, params);
        const formatted = matches.map(m => MatchingController.formatMatchResponse(m));
        res.json({ data: formatted, count: formatted.length });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching NGO matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }

  /**
   * GET /api/matches/for-restaurant/all
   * Get all matches for restaurant
   */
  static async getMatchesForRestaurant(req, res) {
    try {
      const restaurantId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;

      let query = `
        SELECT m.* FROM matches m
        JOIN food_posts fp ON m.food_post_id = fp.id
        WHERE fp.restaurant_id = ?
      `;
      const params = [restaurantId];

      if (status) {
        query += ' AND m.status = ?';
        params.push(status);
      }

      query += ` ORDER BY m.matched_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const connection = await pool.getConnection();
      try {
        const [matches] = await connection.query(query, params);
        const formatted = matches.map(m => MatchingController.formatMatchResponse(m));
        res.json({ data: formatted, count: formatted.length });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching restaurant matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }

  /**
   * GET /api/matches/:id
   * Get match details
   */
  static async getMatch(req, res) {
    try {
      const { id } = req.params;

      const connection = await pool.getConnection();
      try {
        const [matches] = await connection.query(
          'SELECT * FROM matches WHERE id = ?',
          [id]
        );

        if (matches.length === 0) {
          return res.status(404).json({ error: 'Match not found' });
        }

        res.json(MatchingController.formatMatchResponse(matches[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  }

  /**
   * PUT /api/matches/:id/status
   * Update match status through lifecycle
   */
  static async updateMatchStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, volunteer_id, delivery_proof_photo } = req.body;

      if (!['ACCEPTED', 'PICKED_UP', 'DELIVERED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const connection = await pool.getConnection();
      try {
        const [matches] = await connection.query('SELECT * FROM matches WHERE id = ?', [id]);

        if (matches.length === 0) {
          return res.status(404).json({ error: 'Match not found' });
        }

        const match = matches[0];
        const currentStatus = match.status;

        // Validate status progression
        const statusProgression = ['MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'];
        const currentIndex = statusProgression.indexOf(currentStatus);
        const newIndex = statusProgression.indexOf(status);

        if (newIndex <= currentIndex) {
          return res.status(400).json({ error: 'Invalid status transition' });
        }

        // Update match status
        let updateQuery = `UPDATE matches SET status = ?, updated_at = NOW()`;
        const updateParams = [status];

        if (status === 'ACCEPTED') {
          updateQuery += `, accepted_at = NOW()`;
        } else if (status === 'PICKED_UP') {
          if (!volunteer_id) {
            return res.status(400).json({ error: 'volunteer_id required for PICKED_UP' });
          }
          updateQuery += `, picked_up_at = NOW(), volunteer_id = ?`;
          updateParams.push(volunteer_id);
        } else if (status === 'DELIVERED') {
          updateQuery += `, delivered_at = NOW()`;
          if (delivery_proof_photo) {
            updateQuery += `, delivery_proof_photo = ?`;
            updateParams.push(delivery_proof_photo);
          }

          // Log impact
          const [foodPost] = await connection.query(
            'SELECT * FROM food_posts WHERE id = ?',
            [match.food_post_id]
          );

          if (foodPost.length > 0) {
            const mealsCount = foodPost[0].quantity_servings;
            const coSaved = mealsCount * 2.5; // ~2.5kg CO2 per meal
            const waterSaved = mealsCount * 1000; // ~1000L water per meal

            await connection.query(
              `INSERT INTO impact_logs (
                food_post_id, ngo_id, meals_saved, food_saved_kg, co2_saved_kg, water_saved_liters
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [match.food_post_id, match.ngo_id, mealsCount, mealsCount * 0.5, coSaved, waterSaved]
            );
          }
        }

        updateQuery += ' WHERE id = ?';
        updateParams.push(id);

        await connection.query(updateQuery, updateParams);

        // Also update food_post status
        await connection.query(
          'UPDATE food_posts SET status = ?, updated_at = NOW() WHERE id = ?',
          [status, match.food_post_id]
        );

        const [updated] = await connection.query('SELECT * FROM matches WHERE id = ?', [id]);
        res.json(MatchingController.formatMatchResponse(updated[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating match status:', error);
      res.status(500).json({ error: 'Failed to update match status' });
    }
  }

  /**
   * PUT /api/matches/:id/assign-volunteer
   * Assign volunteer to match
   */
  static async assignVolunteer(req, res) {
    try {
      const { id } = req.params;
      const { volunteer_id } = req.body;

      if (!volunteer_id) {
        return res.status(400).json({ error: 'volunteer_id required' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.query(
          'UPDATE matches SET volunteer_id = ?, updated_at = NOW() WHERE id = ?',
          [volunteer_id, id]
        );

        const [updated] = await connection.query('SELECT * FROM matches WHERE id = ?', [id]);
        res.json(MatchingController.formatMatchResponse(updated[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      res.status(500).json({ error: 'Failed to assign volunteer' });
    }
  }
}

module.exports = MatchingController;
