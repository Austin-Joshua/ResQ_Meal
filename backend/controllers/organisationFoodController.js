const pool = require('../config/database');

/**
 * Get NGO id for the current user (role must be ngo).
 */
async function getNgoIdForUser(userId) {
  const [rows] = await pool.query('SELECT id FROM ngos WHERE user_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

/**
 * Get restaurant id for the current user (role must be restaurant / donor).
 */
async function getRestaurantIdForUser(userId) {
  const [rows] = await pool.query('SELECT id FROM restaurants WHERE user_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

/**
 * POST /api/organisation/food
 * Donors (restaurant) add food that will be visible to volunteers. NGOs cannot add food.
 */
async function postFood(req, res) {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Only donors (restaurants) can add food.' });
    }
    const restaurantId = await getRestaurantIdForUser(req.user.id);
    if (!restaurantId) {
      return res.status(403).json({ success: false, message: 'Donor (restaurant) profile not found.' });
    }

    const {
      food_name,
      food_type = 'others',
      quantity_servings = 1,
      description,
      address,
      latitude,
      longitude,
      freshness_score,
      quality_score,
    } = req.body;

    if (!food_name || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields: food_name, address' });
    }

    const validTypes = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'];
    if (!validTypes.includes(food_type)) {
      return res.status(400).json({ success: false, message: 'Invalid food_type' });
    }

    const [result] = await pool.query(
      `INSERT INTO organisation_food (restaurant_id, food_name, food_type, quantity_servings, description, address, latitude, longitude, freshness_score, quality_score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [restaurantId, food_name, food_type, quantity_servings, description || null, address, latitude || null, longitude || null, freshness_score ?? null, quality_score ?? null]
    );

    const [rows] = await pool.query('SELECT * FROM organisation_food WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Food added. It will appear on the volunteer page.',
    });
  } catch (err) {
    console.error('organisationFood.postFood:', err);
    return res.status(500).json({ success: false, message: 'Failed to add food.' });
  }
}

/**
 * GET /api/organisation/food
 * List food posted by the current donor (restaurant) or NGO.
 */
async function getMyOrganisationFood(req, res) {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'ngo' && role !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Only donors or organisations can view their food list.' });
    }
    if (role === 'restaurant') {
      const restaurantId = await getRestaurantIdForUser(req.user.id);
      if (!restaurantId) {
        return res.json({ success: true, data: [] });
      }
      const [rows] = await pool.query(
        'SELECT * FROM organisation_food WHERE restaurant_id = ? ORDER BY created_at DESC',
        [restaurantId]
      );
      return res.json({ success: true, data: rows });
    }
    const ngoId = await getNgoIdForUser(req.user.id);
    if (!ngoId) {
      return res.json({ success: true, data: [] });
    }
    const [rows] = await pool.query(
      'SELECT * FROM organisation_food WHERE ngo_id = ? ORDER BY created_at DESC',
      [ngoId]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('organisationFood.getMyOrganisationFood:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch food list.' });
  }
}

/**
 * GET /api/organisation/food/available
 * List all organisation food with status PENDING (for volunteers to see; donors + NGO).
 */
async function getAvailableOrganisationFood(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT of.*,
         COALESCE(n.organization_name, r.business_name) AS organization_name
       FROM organisation_food of
       LEFT JOIN ngos n ON n.id = of.ngo_id
       LEFT JOIN restaurants r ON r.id = of.restaurant_id
       WHERE of.status = 'PENDING'
         AND (of.ngo_id IS NOT NULL OR of.restaurant_id IS NOT NULL)
       ORDER BY of.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('organisationFood.getAvailableOrganisationFood:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch available food.' });
  }
}

module.exports = {
  postFood,
  getMyOrganisationFood,
  getAvailableOrganisationFood,
};
