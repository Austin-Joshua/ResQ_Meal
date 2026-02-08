/**
 * Persist notifications and emit real-time events to Socket.io.
 * Call initNotificationService(getIO) from server.js after Socket.io is initialized.
 */
const pool = require('../config/database');
let getIO = null;

function initNotificationService(getIOFn) {
  getIO = getIOFn;
}

async function addNotification(userId, { type, title, message, link = null, ref_id = null }) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link, ref_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message || null, link, ref_id ?? null]
    );
  } catch (e) {
    console.error('[notificationService] Insert failed:', e.message);
  }
  if (getIO) {
    try {
      const io = getIO();
      const payload = { type, title, message, link, ref_id, created_at: new Date().toISOString() };
      io.to(`user:${userId}`).emit('notification', payload);
    } catch (e) {
      console.error('[notificationService] Emit failed:', e.message);
    }
  }
}

/** Notify multiple users (e.g. all NGOs for new food). */
async function addNotificationToMany(userIds, payload) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  for (const uid of userIds) {
    await addNotification(uid, payload);
  }
}

module.exports = {
  initNotificationService,
  addNotification,
  addNotificationToMany,
};
