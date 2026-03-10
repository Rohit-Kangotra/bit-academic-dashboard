const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Student Route
router.get('/my-record', roleMiddleware(['student']), attendanceController.getMyRecord);

// Faculty Routes
router.post('/mark', roleMiddleware(['faculty']), attendanceController.markAttendance);
router.get('/class', roleMiddleware(['faculty', 'admin']), attendanceController.getClassAttendance);

// Admin Route
router.get('/analytics', roleMiddleware(['admin']), attendanceController.getAnalytics);

module.exports = router;
