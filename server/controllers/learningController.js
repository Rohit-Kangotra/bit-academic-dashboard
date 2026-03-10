const LearningActivityModel = require('../models/learningActivityModel');
const db = require('../config/db');

const logActivity = async (req, res, next) => {
    try {
        const { roll_no, course_code, activity_type } = req.body;
        if (!roll_no || !course_code || !activity_type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const activity = await LearningActivityModel.createActivity(roll_no, course_code, activity_type);
        res.status(201).json({ message: 'Activity logged', activity });
    } catch (error) {
        next(error);
    }
};

const getLearningAnalytics = async (req, res, next) => {
    try {
        const facultyResult = await db.query(
            "SELECT id FROM faculty WHERE user_id = $1",
            [req.user.id]
        );

        if (facultyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const facultyId = facultyResult.rows[0].id;
        const analytics = await LearningActivityModel.getFacultyLearningAnalytics(facultyId);

        res.status(200).json({ analytics });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    logActivity,
    getLearningAnalytics
};
