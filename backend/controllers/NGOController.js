const pool = require('../config/database');

class NGOController {

  static formatNGOResponse(row) {
    const remaining = Math.max(0, row.daily_capacity - row.used_capacity);
    const utilization = row.daily_capacity > 0 
      ? Math.round((row.used_capacity / row.daily_capacity) * 100)
      : 0;

    return {
      id: row.id,
      user_id: row.user_id,
      organization_name: row.organization_name,
      registration_number: row.registration_number,
      daily_capacity: row.daily_capacity,
      used_capacity: row.used_capacity,
      remaining_capacity: remaining,
      utilization_percent: utilization,
      verified: row.verified,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * GET /api/ngos/:id
   * Get NGO details
   */
  static async getNGO(req, res) {
    try {
      const { id } = req.params;

      const connection = await pool.getConnection();
      try {
        const [ngos] = await connection.query(
          'SELECT * FROM ngos WHERE id = ?',
          [id]
        );

        if (ngos.length === 0) {
          return res.status(404).json({ error: 'NGO not found' });
        }

        res.json(NGOController.formatNGOResponse(ngos[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching NGO:', error);
      res.status(500).json({ error: 'Failed to fetch NGO' });
    }
  }

  /**
   * PUT /api/ngos/:id
   * Update NGO profile
   */
  static async updateNGO(req, res) {
    try {
      const { id } = req.params;
      const { daily_capacity, organization_name } = req.body;

      const connection = await pool.getConnection();
      try {
        const updateQuery = `
          UPDATE ngos SET 
            daily_capacity = COALESCE(?, daily_capacity),
            organization_name = COALESCE(?, organization_name),
            updated_at = NOW()
          WHERE id = ?
        `;

        await connection.query(updateQuery, [
          daily_capacity || null,
          organization_name || null,
          id
        ]);

        const [updated] = await connection.query('SELECT * FROM ngos WHERE id = ?', [id]);
        res.json(NGOController.formatNGOResponse(updated[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating NGO:', error);
      res.status(500).json({ error: 'Failed to update NGO' });
    }
  }

  /**
   * GET /api/ngos/:id/capacity
   * Get capacity metrics
   */
  static async getNGOCapacity(req, res) {
    try {
      const { id } = req.params;

      const connection = await pool.getConnection();
      try {
        const [ngos] = await connection.query(
          'SELECT * FROM ngos WHERE id = ?',
          [id]
        );

        if (ngos.length === 0) {
          return res.status(404).json({ error: 'NGO not found' });
        }

        const ngo = ngos[0];
        const remaining = Math.max(0, ngo.daily_capacity - ngo.used_capacity);
        const utilization = ngo.daily_capacity > 0
          ? Math.round((ngo.used_capacity / ngo.daily_capacity) * 100)
          : 0;

        res.json({
          daily_capacity: ngo.daily_capacity,
          used_capacity: ngo.used_capacity,
          remaining_capacity: remaining,
          utilization_percent: utilization,
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching NGO capacity:', error);
      res.status(500).json({ error: 'Failed to fetch capacity' });
    }
  }

  /**
   * POST /api/ngos/:id/capacity/update
   * Update NGO capacity (when a match is accepted)
   */
  static async updateCapacity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      const connection = await pool.getConnection();
      try {
        const [ngos] = await connection.query(
          'SELECT * FROM ngos WHERE id = ?',
          [id]
        );

        if (ngos.length === 0) {
          return res.status(404).json({ error: 'NGO not found' });
        }

        const ngo = ngos[0];
        const newUsedCapacity = Math.min(
          ngo.used_capacity + quantity,
          ngo.daily_capacity
        );

        await connection.query(
          'UPDATE ngos SET used_capacity = ?, updated_at = NOW() WHERE id = ?',
          [newUsedCapacity, id]
        );

        const [updated] = await connection.query('SELECT * FROM ngos WHERE id = ?', [id]);
        res.json(NGOController.formatNGOResponse(updated[0]));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
      res.status(500).json({ error: 'Failed to update capacity' });
    }
  }
}

module.exports = NGOController;
