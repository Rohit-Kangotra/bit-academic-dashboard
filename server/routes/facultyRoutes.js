const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['faculty', 'admin']));

router.get('/schedule', facultyController.getSchedule);
router.get('/projects', facultyController.getProjects);
router.get('/students', facultyController.getStudents);
router.get('/mentees', facultyController.getMyMentees);

module.exports = router;
