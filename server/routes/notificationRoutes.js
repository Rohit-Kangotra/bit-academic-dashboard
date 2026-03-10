const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/v1/notifications
router.get('/', notificationController.getNotifications);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
