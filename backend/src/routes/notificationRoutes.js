const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateNotificationQuery } = require('../validators/notificationValidator');

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// SSE stream endpoint
router.get('/stream', notificationController.streamNotifications);

// Get notification history
router.get('/', validateNotificationQuery, notificationController.getNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;