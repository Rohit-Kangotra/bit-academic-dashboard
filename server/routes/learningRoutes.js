const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const roleMiddleware = require('../middleware/roleMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// POST /api/v1/learning/activity
router.post('/activity', roleMiddleware(['student', 'admin']), learningController.logActivity);

// GET /api/v1/learning/faculty/learning-analytics
router.get('/faculty/learning-analytics', roleMiddleware(['faculty', 'admin']), learningController.getLearningAnalytics);

module.exports = router;
