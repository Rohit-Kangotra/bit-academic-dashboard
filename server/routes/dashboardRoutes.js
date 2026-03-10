const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/student', roleMiddleware(['student']), dashboardController.getStudentDashboard);
router.get('/faculty', roleMiddleware(['faculty', 'admin']), dashboardController.getFacultyDashboard);

module.exports = router;
