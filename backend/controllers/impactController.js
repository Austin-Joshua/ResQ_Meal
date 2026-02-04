const { pool } = require('../server');

class ImpactController {
  
  static formatImpactResponse(row) {
    return {
      meals_saved: parseInt(row.meals_saved) || 0,
      food_saved_kg: parseFloat(row.food_saved_kg) || 0,
      co2_saved_kg: parseFloat(row.co2_saved_kg) || 0,
      water_saved_liters: parseFloat(row.water_saved_liters) || 0,
      total_deliveries: parseInt(row.total_deliveries) || 0,
    };
  }

  static getPeriodClause(period) {
    const now = new Date();
    switch(period) {
      case 'today':
        return `DATE(il.created_at) = CURDATE()`;
      case 'week':
        return `il.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      case 'month':
        return `il.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      case 'all':
      default:
        return `1=1`;
    }
  }

  /**
   * GET /api/impact/ngo
   * Impact metrics for NGO
   */
  static async getNGOImpact(req, res) {
    try {
      const ngoId = req.user.id;
      const { period = 'all' } = req.query;

      const periodClause = ImpactController.getPeriodClause(period);

      const connection = await pool.getConnection();
      try {
        const [results] = await connection.query(
          `
          SELECT
            SUM(il.meals_saved) as meals_saved,
            SUM(il.food_saved_kg) as food_saved_kg,
            SUM(il.co2_saved_kg) as co2_saved_kg,
            SUM(il.water_saved_liters) as water_saved_liters,
            COUNT(DISTINCT il.food_post_id) as total_deliveries
          FROM impact_logs il
          WHERE il.ngo_id = ? AND ${periodClause}
          `,
          [ngoId]
        );

        const data = results[0] || {};
        res.json(ImpactController.formatImpactResponse(data));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching NGO impact:', error);
      res.status(500).json({ error: 'Failed to fetch NGO impact' });
    }
  }

  /**
   * GET /api/impact/restaurant
   * Impact metrics for restaurant
   */
  static async getRestaurantImpact(req, res) {
    try {
      const restaurantId = req.user.id;
      const { period = 'all' } = req.query;

      const periodClause = ImpactController.getPeriodClause(period);

      const connection = await pool.getConnection();
      try {
        const [results] = await connection.query(
          `
          SELECT
            SUM(il.meals_saved) as meals_saved,
            SUM(il.food_saved_kg) as food_saved_kg,
            SUM(il.co2_saved_kg) as co2_saved_kg,
            SUM(il.water_saved_liters) as water_saved_liters,
            COUNT(DISTINCT il.food_post_id) as total_deliveries
          FROM impact_logs il
          JOIN food_posts fp ON il.food_post_id = fp.id
          WHERE fp.restaurant_id = ? AND ${periodClause}
          `,
          [restaurantId]
        );

        const data = results[0] || {};
        res.json(ImpactController.formatImpactResponse(data));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching restaurant impact:', error);
      res.status(500).json({ error: 'Failed to fetch restaurant impact' });
    }
  }

  /**
   * GET /api/impact/global
   * Global impact metrics (public)
   */
  static async getGlobalImpact(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        const [results] = await connection.query(
          `
          SELECT
            SUM(il.meals_saved) as meals_saved,
            SUM(il.food_saved_kg) as food_saved_kg,
            SUM(il.co2_saved_kg) as co2_saved_kg,
            SUM(il.water_saved_liters) as water_saved_liters,
            COUNT(DISTINCT il.food_post_id) as total_deliveries
          FROM impact_logs il
          `
        );

        const data = results[0] || {};
        res.json(ImpactController.formatImpactResponse(data));
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching global impact:', error);
      res.status(500).json({ error: 'Failed to fetch global impact' });
    }
  }

  /**
   * GET /api/impact/timeline
   * Impact timeline for dashboard chart
   * Returns daily aggregate data
   */
  static async getImpactTimeline(req, res) {
    try {
      const { days = 7 } = req.query;

      const connection = await pool.getConnection();
      try {
        const [results] = await connection.query(
          `
          SELECT
            DATE(il.created_at) as date,
            SUM(il.meals_saved) as meals_saved,
            SUM(il.food_saved_kg) as food_saved_kg,
            SUM(il.co2_saved_kg) as co2_saved_kg,
            SUM(il.water_saved_liters) as water_saved_liters,
            COUNT(DISTINCT il.food_post_id) as deliveries
          FROM impact_logs il
          WHERE il.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(il.created_at)
          ORDER BY date DESC
          `,
          [parseInt(days)]
        );

        const timeline = results.map(row => ({
          date: row.date,
          meals_saved: parseInt(row.meals_saved) || 0,
          food_saved_kg: parseFloat(row.food_saved_kg) || 0,
          co2_saved_kg: parseFloat(row.co2_saved_kg) || 0,
          water_saved_liters: parseFloat(row.water_saved_liters) || 0,
          deliveries: parseInt(row.deliveries) || 0,
        }));

        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
        res.json({ timeline });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching impact timeline:', error);
      res.status(500).json({ error: 'Failed to fetch impact timeline' });
    }
  }
}

module.exports = ImpactController;
