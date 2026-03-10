const db = require('../config/db');

const submitActivity = async (req, res, next) => {
    try {
        const { activity_name, category, description, proof_link } = req.body;

        // Find student roll no
        const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student profile not found.' });

        const roll_no = studentRes.rows[0].roll_no;

        const result = await db.query(`
            INSERT INTO activity_submissions (roll_no, activity_name, category, description, proof_link, status, points_awarded)
            VALUES ($1, $2, $3, $4, $5, 'Pending', 0) RETURNING *
        `, [roll_no, activity_name, category, description, proof_link]);

        res.status(201).json({ message: 'Activity submitted for review', submission: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getActivities = async (req, res, next) => {
    try {
        if (req.user.role === 'student') {
            const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
            if (studentRes.rows.length === 0) return res.status(200).json({ submissions: [] });

            const { rows } = await db.query(`
                SELECT * FROM activity_submissions WHERE roll_no = $1 ORDER BY submitted_at DESC
            `, [studentRes.rows[0].roll_no]);

            return res.status(200).json({ submissions: rows });
        } else {
            const { rows } = await db.query(`
                SELECT a.*, s.name as student_name, s.department 
                FROM activity_submissions a
                JOIN students s ON a.roll_no = s.roll_no
                ORDER BY a.submitted_at DESC
            `);
            return res.status(200).json({ submissions: rows });
        }
    } catch (error) {
        next(error);
    }
};

const reviewActivity = async (req, res, next) => {
    try {
        const { activity_id, status, points_awarded } = req.body; // 'Approved' or 'Rejected'

        const subRes = await db.query('SELECT * FROM activity_submissions WHERE id = $1', [activity_id]);
        if (subRes.rows.length === 0) return res.status(404).json({ message: 'Submission not found' });

        const submission = subRes.rows[0];

        // Update Submission
        const result = await db.query(`
            UPDATE activity_submissions SET status = $1, points_awarded = $2 WHERE id = $3 RETURNING *
        `, [status, points_awarded || 0, activity_id]);

        // If Approved, Update Student Points
        if (status === 'Approved') {
            await db.query(`
                UPDATE students SET 
                    reward_points = COALESCE(reward_points, 0) + $1
                WHERE roll_no = $2
            `, [points_awarded || 0, submission.roll_no]);
        }

        // Notify student
        const studentRes = await db.query('SELECT user_id FROM students WHERE roll_no = $1', [submission.roll_no]);
        if (studentRes.rows.length > 0) {
            const NotificationModel = require('../models/notificationModel');
            await NotificationModel.createNotification(
                studentRes.rows[0].user_id,
                `Activity ${status}`,
                `Your activity submission "${submission.activity_name}" has been ${status.toLowerCase()}${status === 'Approved' ? ` and earned you ${points_awarded} points!` : '.'}`
            );
        }

        res.status(200).json({ message: `Activity ${status}`, submission: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitActivity,
    getActivities,
    reviewActivity,
};
