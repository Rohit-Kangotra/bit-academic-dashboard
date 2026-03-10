const CourseModel = require('../models/courseModel');
const db = require('../config/db');

const getAllCourses = async (req, res, next) => {
    try {
        const courses = await CourseModel.findAll();
        res.status(200).json({ courses });
    } catch (error) {
        next(error);
    }
};

const getCourseById = async (req, res, next) => {
    try {
        const course = await CourseModel.findByCode(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ course });
    } catch (error) {
        next(error);
    }
};

const getCourseLessons = async (req, res, next) => {
    try {
        const course_code = req.params.courseCode;
        const lessons = await CourseModel.getLessons(course_code);

        let progress = [];
        if (req.user && req.user.role === 'student') {
            const roll_no = await CourseModel.getStudentRollNo(req.user.id);
            if (roll_no) {
                progress = await CourseModel.getProgress(roll_no, course_code);
            }
        }

        res.status(200).json({ lessons, progress });
    } catch (error) {
        next(error);
    }
};

const markLessonComplete = async (req, res, next) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can mark lessons as complete' });
        }
        const course_code = req.params.courseCode;
        const lesson_id = req.params.lessonId;
        const roll_no = await CourseModel.getStudentRollNo(req.user.id);

        if (!roll_no) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const result = await CourseModel.markLessonComplete(roll_no, course_code, lesson_id);

        // Also log real-time learning activity
        await db.query(
            "INSERT INTO learning_activity (roll_no, course_code, activity_type) VALUES ($1, $2, $3)",
            [roll_no, course_code, 'lesson_completed']
        );

        res.status(200).json({ message: 'Lesson marked as complete', progress: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    getCourseLessons,
    markLessonComplete,
};
