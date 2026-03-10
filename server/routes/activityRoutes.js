const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Student Routes
router.post('/submit', roleMiddleware(['student']), activityController.submitActivity);
router.get('/my-submissions', roleMiddleware(['student']), activityController.getMySubmissions);

// Admin / Faculty Routes
router.get('/pending', roleMiddleware(['admin', 'faculty']), activityController.getPendingReviews);
router.put('/review/:submission_id', roleMiddleware(['admin', 'faculty']), activityController.reviewActivity);

module.exports = router;
