const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Shared Routes
router.get('/', activityController.getActivities);

// Student Routes
router.post('/submit', roleMiddleware(['student']), activityController.submitActivity);

// Admin / Faculty Routes
router.put('/review', roleMiddleware(['admin', 'faculty']), activityController.reviewActivity);

module.exports = router;
