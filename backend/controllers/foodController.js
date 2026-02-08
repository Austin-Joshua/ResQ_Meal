const { pool } = require('../server');
const FoodQualityVerification = require('../services/FoodQualityVerification');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class FoodController {
  
  /**
   * Calculate urgency score based on:
   * - Time remaining (0-40 = far, 41-70 = medium, 71-100 = urgent)
   * - Quantity (excess = higher urgency)
   */
  static calculateUrgencyScore(safetyWindowMinutes, quantityServings) {
    let score = 50; // default baseline
    
    // Reduce score if lots of time left
    if (safetyWindowMinutes > 120) {
      score -= 15;
    } else if (safetyWindowMinutes > 60) {
      score -= 5;
    } else if (safetyWindowMinutes <= 30) {
      score += 25; // urgent if little time
    }
    
    // Increase score for large quantities
    if (quantityServings > 50) {
      score += 20;
    } else if (quantityServings > 30) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score)); // clamp 0-100
  }

  static formatFoodResponse(row) {
    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      food_name: row.food_name,
      food_type: row.food_type,
      quantity_servings: row.quantity_servings,
      description: row.description,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        address: row.address,
      },
      photo_url: row.photo_url,
      preparation_timestamp: row.preparation_timestamp,
      safety_window_minutes: row.safety_window_minutes,
      expiry_time: row.expiry_time,
      min_storage_temp_celsius: row.min_storage_temp_celsius ? parseFloat(row.min_storage_temp_celsius) : null,
      max_storage_temp_celsius: row.max_storage_temp_celsius ? parseFloat(row.max_storage_temp_celsius) : null,
      availability_time_hours: row.availability_time_hours || null,
      freshness_score: parseFloat(row.freshness_score),
      quality_score: row.quality_score ? parseFloat(row.quality_score) : null,
      urgency_score: row.urgency_score, // 0-100: critical if > 70
      status: row.status, // POSTED | MATCHED | ACCEPTED | PICKED_UP | DELIVERED | EXPIRED
      // Timeline support for UI
      timestamps: {
        posted_at: row.posted_at,
        matched_at: row.matched_at,
        accepted_at: row.accepted_at,
        picked_up_at: row.picked_up_at,
        delivered_at: row.delivered_at,
        expired_at: row.expired_at,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Get restaurant id for the current user (role restaurant).
   */
  static async getRestaurantIdForUser(userId) {
    const [rows] = await pool.query('SELECT id FROM restaurants WHERE user_id = ?', [userId]);
    return rows[0]?.id ?? null;
  }

  /**
   * POST /api/food
   * Restaurant (donor) posts excess food. If user has no restaurant record, one is created so any authenticated user can post.
   */
  static async postFood(req, res) {
    try {
      let restaurantId = await FoodController.getRestaurantIdForUser(req.user.id);
      if (!restaurantId) {
        const connection = await pool.getConnection();
        try {
          const [userRows] = await connection.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
          const businessName = (userRows[0]?.name || 'Donor').trim() || 'Donor';
          const [insertResult] = await connection.query(
            'INSERT INTO restaurants (user_id, business_name) VALUES (?, ?)',
            [req.user.id, businessName]
          );
          restaurantId = insertResult.insertId;
        } finally {
          connection.release();
        }
      }
      const {
        food_name,
        food_type,
        quantity_servings,
        description,
        latitude,
        longitude,
        address,
        safety_window_minutes = 30,
        min_storage_temp_celsius = null,
        max_storage_temp_celsius = null,
        availability_time_hours = null,
        photo_url = null,
      } = req.body;

      // Validate
      if (!food_name || !food_type || !quantity_servings || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const expiryTime = new Date(Date.now() + safety_window_minutes * 60000);
      const urgencyScore = FoodController.calculateUrgencyScore(safety_window_minutes, quantity_servings);

      const connection = await pool.getConnection();
      try {
        const [result] = await connection.query(
          `INSERT INTO food_posts (
            restaurant_id, food_name, food_type, quantity_servings, description,
            latitude, longitude, address, safety_window_minutes, expiry_time,
            min_storage_temp_celsius, max_storage_temp_celsius, availability_time_hours,
            photo_url, preparation_timestamp, urgency_score, status, posted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'POSTED', NOW())`,
          [
            restaurantId,
            food_name,
            food_type,
            quantity_servings,
            description || null,
            latitude || null,
            longitude || null,
            address,
            safety_window_minutes,
            expiryTime,
            min_storage_temp_celsius || null,
            max_storage_temp_celsius || null,
            availability_time_hours || null,
            photo_url,
            new Date(),
            urgencyScore,
          ]
        );

        const [newPost] = await connection.query(
          'SELECT * FROM food_posts WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json(FoodController.formatFoodResponse(newPost[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error posting food:', error);
      res.status(500).json({ error: 'Failed to post food' });
    }
  }

  /**
   * GET /api/food/my-posts
   * Get restaurant's posted food
   */
  static async getMyPosts(req, res) {
    try {
      const restaurantId = await FoodController.getRestaurantIdForUser(req.user.id);
      if (!restaurantId) {
        return res.json({ data: [], count: 0 });
      }
      const { status, limit = 20, offset = 0 } = req.query;

      let query = 'SELECT * FROM food_posts WHERE restaurant_id = ?';
      const params = [restaurantId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ` ORDER BY posted_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const connection = await pool.getConnection();
      try {
        const [posts] = await connection.query(query, params);
        const formatted = posts.map(p => FoodController.formatFoodResponse(p));
        res.json({ data: formatted, count: posts.length });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching my posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  /**
   * GET /api/food/:id
   * Get single food post with all details
   */
  static async getFoodPost(req, res) {
    try {
      const { id } = req.params;

      const connection = await pool.getConnection();
      try {
        const [posts] = await connection.query(
          'SELECT * FROM food_posts WHERE id = ?',
          [id]
        );

        if (posts.length === 0) {
          return res.status(404).json({ error: 'Food post not found' });
        }

        res.json(FoodController.formatFoodResponse(posts[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching food post:', error);
      res.status(500).json({ error: 'Failed to fetch food post' });
    }
  }

  /**
   * GET /api/food/available/all
   * Get available food for NGOs (not expired, not delivered)
   */
  static async getAvailableFood(req, res) {
    try {
      const { latitude, longitude, radius_km = 5, food_type, min_urgency, max_urgency, limit = 50 } = req.query;

      let query = `
        SELECT * FROM food_posts 
        WHERE status IN ('POSTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP')
        AND expiry_time > NOW()
      `;
      const params = [];

      if (food_type) {
        query += ' AND food_type = ?';
        params.push(food_type);
      }

      if (min_urgency !== undefined) {
        query += ' AND urgency_score >= ?';
        params.push(parseInt(min_urgency));
      }

      if (max_urgency !== undefined) {
        query += ' AND urgency_score <= ?';
        params.push(parseInt(max_urgency));
      }

      query += ` ORDER BY posted_at DESC, urgency_score DESC LIMIT ${limit}`;

      const connection = await pool.getConnection();
      try {
        const [posts] = await connection.query(query, params);
        const formatted = posts.map(p => FoodController.formatFoodResponse(p));
        res.json({ data: formatted, count: formatted.length });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching available food:', error);
      res.status(500).json({ error: 'Failed to fetch available food' });
    }
  }

  /**
   * PUT /api/food/:id
   * Update food post (only before MATCHED status)
   */
  static async updateFoodPost(req, res) {
    try {
      const { id } = req.params;
      const restaurantId = await FoodController.getRestaurantIdForUser(req.user.id);
      if (!restaurantId) {
        return res.status(403).json({ error: 'Only donors (restaurants) can update food posts.' });
      }
      const { food_name, quantity_servings, description, photo_url } = req.body;

      const connection = await pool.getConnection();
      try {
        // Check if post belongs to restaurant and is not matched
        const [post] = await connection.query(
          'SELECT * FROM food_posts WHERE id = ? AND restaurant_id = ?',
          [id, restaurantId]
        );

        if (post.length === 0) {
          return res.status(404).json({ error: 'Food post not found' });
        }

        if (post[0].status !== 'POSTED') {
          return res.status(400).json({ error: 'Cannot update post after POSTED status' });
        }

        await connection.query(
          `UPDATE food_posts SET 
            food_name = COALESCE(?, food_name),
            quantity_servings = COALESCE(?, quantity_servings),
            description = COALESCE(?, description),
            photo_url = COALESCE(?, photo_url),
            updated_at = NOW()
          WHERE id = ?`,
          [food_name || null, quantity_servings || null, description || null, photo_url || null, id]
        );

        const [updated] = await connection.query('SELECT * FROM food_posts WHERE id = ?', [id]);
        res.json(FoodController.formatFoodResponse(updated[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating food post:', error);
      res.status(500).json({ error: 'Failed to update food post' });
    }
  }

  /**
   * DELETE /api/food/:id
   * Delete food post (only in POSTED status)
   */
  static async deleteFoodPost(req, res) {
    try {
      const { id } = req.params;
      const restaurantId = await FoodController.getRestaurantIdForUser(req.user.id);
      if (!restaurantId) {
        return res.status(403).json({ error: 'Only donors (restaurants) can delete food posts.' });
      }

      const connection = await pool.getConnection();
      try {
        const [post] = await connection.query(
          'SELECT * FROM food_posts WHERE id = ? AND restaurant_id = ?',
          [id, restaurantId]
        );

        if (post.length === 0) {
          return res.status(404).json({ error: 'Food post not found' });
        }

        if (post[0].status !== 'POSTED') {
          return res.status(400).json({ error: 'Cannot delete post after POSTED status' });
        }

        await connection.query('DELETE FROM food_posts WHERE id = ?', [id]);
        res.json({ message: 'Food post deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting food post:', error);
      res.status(500).json({ error: 'Failed to delete food post' });
    }
  }

  /**
   * POST /api/food/assess-freshness
   * Upload image; returns freshness assessment (uses fruit-veg-freshness-ai when FRESHNESS_AI_URL is set).
   * On ML/processing error, returns a mock assessment with 200 so the frontend always gets a valid shape.
   */
  static async assessFreshness(req, res) {
    try {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }
      let assessment;
      try {
        assessment = await FoodQualityVerification.assessFreshnessForFrontend(req.file.path);
      } catch (err) {
        console.error('Error assessing freshness (using mock):', err);
        assessment = FoodQualityVerification.mockFrontendAssessment();
      }
      res.json(assessment);
    } catch (error) {
      console.error('Error assessing freshness:', error);
      res.status(500).json({ error: 'Failed to assess food freshness' });
    }
  }

  /**
   * POST /api/food/assess-freshness-by-environment
   * Body: { temperature, humidity, time_stored_hours, gas? }.
   * Uses Food-Freshness-Analyzer when FRESHNESS_ENV_AI_URL is set.
   * On ML/processing error, returns a mock assessment with 200 so the frontend always gets a valid shape.
   */
  static async assessFreshnessByEnvironment(req, res) {
    try {
      const { temperature, humidity, time_stored_hours, gas } = req.body || {};
      if (temperature == null || humidity == null || time_stored_hours == null) {
        return res.status(400).json({
          error: 'Missing required fields: temperature, humidity, time_stored_hours',
        });
      }
      let assessment;
      try {
        assessment = await FoodQualityVerification.assessFreshnessByEnvironmentForFrontend({
          temperature: Number(temperature),
          humidity: Number(humidity),
          time_stored_hours: Number(time_stored_hours),
          gas: gas != null ? Number(gas) : undefined,
        });
      } catch (err) {
        console.error('Error assessing freshness by environment (using mock):', err);
        assessment = FoodQualityVerification.mockFrontendAssessment();
      }
      res.json(assessment);
    } catch (error) {
      console.error('Error assessing freshness by environment:', error);
      res.status(500).json({ error: 'Failed to assess food freshness' });
    }
  }

  /**
   * POST /api/food/classify-image
   * Upload image; returns food class, food name, confidence, and optional nutrition (Food-Image-Recognition when FOOD_IMAGE_RECOGNITION_URL is set).
   */
  static async classifyImage(req, res) {
    try {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }
      const baseUrl = (process.env.FOOD_IMAGE_RECOGNITION_URL || '').replace(/\/$/, '');
      if (!baseUrl) {
        return res.status(503).json({
          error: 'Food classification service not configured',
          hint: 'Set FOOD_IMAGE_RECOGNITION_URL to the Food-Image-Recognition API URL (e.g. http://localhost:8005)',
        });
      }
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.path.split(/[/\\]/).pop() || 'image.png',
        contentType: 'image/png',
      });
      const { data } = await axios.post(`${baseUrl}/evaluate`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        timeout: 30000,
      });
      res.json(data);
    } catch (error) {
      console.error('Error classifying food image:', error);
      res.status(500).json({
        error: 'Failed to classify food image',
        message: error.response?.data?.detail || error.message,
      });
    }
  }
}

module.exports = FoodController;
