const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all notifications
router.delete('/', deleteAllNotifications);

module.exports = router;