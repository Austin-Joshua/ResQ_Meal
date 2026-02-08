const router = require('express').Router();
const { authenticateToken } = require('../middlewares/auth');
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markRead);
router.post('/read-all', authenticateToken, markAllRead);

module.exports = router;
