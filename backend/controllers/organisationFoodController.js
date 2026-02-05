function getPool() {
  const { pool } = require('../server');
  return pool;
}

/**
 * Get NGO id for the current user (role must be ngo).
 */
async function getNgoIdForUser(userId) {
  const [rows] = await getPool().query('SELECT id FROM ngos WHERE user_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

/**
 * POST /api/organisation/food
 * Organisation (NGO) adds food that will be visible to volunteers.
 */
async function postFood(req, res) {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Only organisations (NGOs) can add food.' });
    }
    const ngoId = await getNgoIdForUser(req.user.id);
    if (!ngoId) {
      return res.status(403).json({ success: false, message: 'NGO profile not found.' });
    }

    const {
      food_name,
      food_type = 'others',
      quantity_servings = 1,
      description,
      address,
      latitude,
      longitude,
    } = req.body;

    if (!food_name || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields: food_name, address' });
    }

    const validTypes = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'];
    if (!validTypes.includes(food_type)) {
      return res.status(400).json({ success: false, message: 'Invalid food_type' });
    }

    const [result] = await getPool().query(
      `INSERT INTO organisation_food (ngo_id, food_name, food_type, quantity_servings, description, address, latitude, longitude, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [ngoId, food_name, food_type, quantity_servings, description || null, address, latitude || null, longitude || null]
    );

    const [rows] = await getPool().query('SELECT * FROM organisation_food WHERE id = ?', [result.insertId]);
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
 * List food posted by the current organisation (NGO).
 */
async function getMyOrganisationFood(req, res) {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Only organisations can view their food list.' });
    }
    const ngoId = await getNgoIdForUser(req.user.id);
    if (!ngoId) {
      return res.status(403).json({ success: false, message: 'NGO profile not found.' });
    }

    const [rows] = await getPool().query(
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
 * List all organisation food with status PENDING (for volunteers to see).
 */
async function getAvailableOrganisationFood(req, res) {
  try {
    const [rows] = await getPool().query(
      `SELECT of.*, n.organization_name
       FROM organisation_food of
       JOIN ngos n ON n.id = of.ngo_id
       WHERE of.status = 'PENDING'
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
