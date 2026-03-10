const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:courseCode/lessons', courseController.getCourseLessons);
router.post('/:courseCode/lessons/:lessonId/complete', courseController.markLessonComplete);

module.exports = router;
