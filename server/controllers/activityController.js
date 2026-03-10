const db = require('../config/db');

const submitActivity = async (req, res, next) => {
    try {
        const { activity_type, description, proof_url, points_requested } = req.body;

        // Find student roll no
        const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student profile not found.' });

        const roll_no = studentRes.rows[0].roll_no;

        const result = await db.query(`
            INSERT INTO activity_submissions (roll_no, activity_type, description, proof_url, points_requested)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [roll_no, activity_type, description, proof_url, points_requested]);

        res.status(201).json({ message: 'Activity submitted for review', submission: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getMySubmissions = async (req, res, next) => {
    try {
        const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(200).json({ submissions: [] });

        const { rows } = await db.query(`
            SELECT * FROM activity_submissions WHERE roll_no = $1 ORDER BY submitted_date DESC
        `, [studentRes.rows[0].roll_no]);

        res.status(200).json({ submissions: rows });
    } catch (error) {
        next(error);
    }
};

const getPendingReviews = async (req, res, next) => {
    try {
        const { rows } = await db.query(`
            SELECT a.*, s.name, s.department 
            FROM activity_submissions a
            JOIN students s ON a.roll_no = s.roll_no
            WHERE a.status = 'Pending'
            ORDER BY a.submitted_date ASC
        `);
        res.status(200).json({ pending: rows });
    } catch (error) {
        next(error);
    }
};

const reviewActivity = async (req, res, next) => {
    try {
        const { submission_id } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'

        const subRes = await db.query('SELECT * FROM activity_submissions WHERE id = $1', [submission_id]);
        if (subRes.rows.length === 0) return res.status(404).json({ message: 'Submission not found' });

        const submission = subRes.rows[0];

        // Update Submission
        const result = await db.query(`
            UPDATE activity_submissions SET status = $1 WHERE id = $2 RETURNING *
        `, [status, submission_id]);

        // If Approved, Update Student Points
        if (status === 'Approved') {
            await db.query(`
                UPDATE students SET 
                    reward_points = reward_points + $1,
                    balance_points = balance_points + $1
                WHERE roll_no = $2
            `, [submission.points_requested, submission.roll_no]);
        }

        res.status(200).json({ message: `Activity ${status}`, submission: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitActivity,
    getMySubmissions,
    getPendingReviews,
    reviewActivity,
};
