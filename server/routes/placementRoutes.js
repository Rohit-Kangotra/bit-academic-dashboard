const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin Routes
router.post('/', roleMiddleware(['admin']), placementController.createDrive);
router.get('/', roleMiddleware(['admin']), placementController.getAllDrives);
router.put('/:id', roleMiddleware(['admin']), placementController.updateDrive);

// Student Routes
router.get('/upcoming', roleMiddleware(['student', 'admin']), placementController.getUpcomingDrives);
router.post('/apply', roleMiddleware(['student']), placementController.applyForDrive);
router.get('/my-applications', roleMiddleware(['student']), placementController.getMyApplications);

// Faculty Routes
router.get('/student-progress', roleMiddleware(['faculty', 'admin']), placementController.getStudentProgress);

module.exports = router;
