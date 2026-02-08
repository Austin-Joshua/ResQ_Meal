const pool = require('../config/database');

/**
 * GET /api/notifications
 * List notifications for current user (recent first, optional unread only).
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { unread_only, limit = 50 } = req.query;
    let query = 'SELECT id, type, title, message, link, ref_id, read_at, created_at FROM notifications WHERE user_id = ?';
    const params = [userId];
    if (unread_only === 'true' || unread_only === true) {
      query += ' AND read_at IS NULL';
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Math.min(parseInt(limit, 10) || 50, 100));
    const [rows] = await pool.query(query, params);
    const unreadCount = await pool.query(
      'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read_at IS NULL',
      [userId]
    ).then(([r]) => r[0].c);
    res.json({ data: rows, unreadCount: Number(unreadCount) });
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ data: [], unreadCount: 0 });
    }
    console.error('getNotifications:', e);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark one notification as read.
 */
async function markRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') return res.json({ success: true });
    console.error('markRead:', e);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for current user.
 */
async function markAllRead(req, res) {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [userId]);
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') return res.json({ success: true });
    console.error('markAllRead:', e);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
}

module.exports = { getNotifications, markRead, markAllRead };
