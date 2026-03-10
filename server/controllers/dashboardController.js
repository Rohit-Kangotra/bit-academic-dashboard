const db = require('../config/db');
const LeaveModel = require('../models/leaveModel');

const getStudentDashboard = async (req, res, next) => {
    try {
        const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
        if (!studentRes.rows[0]) return res.status(404).json({ message: 'Student not found' });
        const student = studentRes.rows[0];

        // Attendance
        const attRes = await db.query('SELECT status, COUNT(*) as count FROM attendance WHERE roll_no = $1 GROUP BY status', [student.roll_no]);
        let totalClasses = 0;
        let presentCount = 0;
        attRes.rows.forEach(r => {
            totalClasses += parseInt(r.count);
            if (r.status === 'PRESENT') presentCount += parseInt(r.count);
        });
        const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

        // Placements
        const placementRes = await db.query('SELECT COUNT(*) as count FROM placement_applications WHERE roll_no = $1', [student.roll_no]);
        const applicationsCount = parseInt(placementRes.rows[0].count);

        // Courses Progress Overall
        const lessonsRes = await db.query('SELECT COUNT(*) as total FROM course_lessons');
        const totalLessons = parseInt(lessonsRes.rows[0].total) || 1; // avoid /0
        const progressRes = await db.query("SELECT COUNT(*) as completed FROM course_progress WHERE student_roll_no = $1 AND status = 'completed'", [student.roll_no]);
        const completedLessons = parseInt(progressRes.rows[0].completed);
        const courseProgressPercentage = Math.round((completedLessons / totalLessons) * 100);

        res.status(200).json({
            cgpa: student.cgpa,
            attendance: attendancePercentage,
            reward_points: student.reward_points || student.balance_points || 0,
            placements_applied: applicationsCount,
            total_classes: totalClasses,
            present_classes: presentCount,
            course_progress: courseProgressPercentage
        });
    } catch (error) {
        next(error);
    }
};

const getFacultyDashboard = async (req, res, next) => {
    try {
        const facultyRes = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
        if (!facultyRes.rows[0]) {
            return res.status(200).json({
                total_mentees: 0,
                pending_leaves_count: 0,
                pending_leaves: []
            });
        }
        const facultyId = facultyRes.rows[0].id;

        // Students count
        const menteesRes = await db.query('SELECT COUNT(*) as count FROM students WHERE mentor_id = $1', [facultyId]);
        const totalMentees = parseInt(menteesRes.rows[0].count);

        // Pending Leaves
        const pendingLeaves = await LeaveModel.getPendingLeaves(facultyId);

        res.status(200).json({
            total_mentees: totalMentees,
            pending_leaves_count: pendingLeaves.length,
            pending_leaves: pendingLeaves
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentDashboard,
    getFacultyDashboard
};
