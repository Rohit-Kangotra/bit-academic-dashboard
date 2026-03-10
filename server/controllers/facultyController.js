const FacultyModel = require('../models/facultyModel');
const StudentModel = require('../models/studentModel');
const ProjectModel = require('../models/projectModel');
const db = require('../config/db');

const getSchedule = async (req, res, next) => {
    try {
        const schedule = await FacultyModel.getSchedule(req.user.id);
        res.status(200).json({ schedule });
    } catch (error) {
        next(error);
    }
};

const getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectModel.findByFaculty(req.user.id);
        res.status(200).json({ projects });
    } catch (error) {
        next(error);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const facultyInfo = await FacultyModel.findByUserId(req.user.id);
        if (!facultyInfo) {
            return res.status(200).json({ students: [], faculty: null });
        }
        const students = await StudentModel.findByMentor(facultyInfo.id);
        res.status(200).json({ students, faculty: facultyInfo });
    } catch (error) {
        next(error);
    }
};

const getMyMentees = async (req, res, next) => {
    try {
        console.log("Logged in user id:", req.user.id);

        const facultyResult = await db.query(
            "SELECT id FROM faculty WHERE user_id = $1",
            [req.user.id]
        );

        if (facultyResult.rows.length === 0) {
            return res.status(200).json({ mentees: [] });
        }

        const facultyId = facultyResult.rows[0].id;

        const query = `
            SELECT
                s.roll_no,
                s.name,
                s.department,
                s.cgpa,
                s.reward_points,
                s.semester,
                s.batch,
                COALESCE(
                    (SELECT ROUND((COUNT(*) FILTER (WHERE status = 'PRESENT')::numeric / NULLIF(COUNT(*), 0)) * 100)
                     FROM attendance a WHERE a.roll_no = s.roll_no), 0
                ) as attendance
            FROM students s
            WHERE s.mentor_id = $1
        `;
        const result = await db.query(query, [facultyId]);
        console.log("Mentees returned:", result.rows.length);

        res.status(200).json({ mentees: result.rows });
    } catch (error) {
        console.error("Error in getMyMentees:", error);
        next(error);
    }
};

const getStudentProfile = async (req, res, next) => {
    try {
        const { rollNo } = req.params;
        const facultyResult = await db.query(
            "SELECT id FROM faculty WHERE user_id = $1",
            [req.user.id]
        );
        if (facultyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Student Info
        const studentRes = await db.query(
            "SELECT * FROM students WHERE roll_no = $1 AND mentor_id = $2",
            [rollNo, facultyResult.rows[0].id]
        );
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or not assigned to you' });
        }
        const student = studentRes.rows[0];

        // Academic Stats (Attendance, placements)
        const attRes = await db.query('SELECT status, COUNT(*) as count FROM attendance WHERE roll_no = $1 GROUP BY status', [rollNo]);
        let totalClasses = 0, presentCount = 0;
        attRes.rows.forEach(r => {
            totalClasses += parseInt(r.count);
            if (r.status === 'PRESENT') presentCount += parseInt(r.count);
        });
        const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

        const placementRes = await db.query('SELECT COUNT(*) as count FROM placement_applications WHERE roll_no = $1', [rollNo]);
        const placementsApplied = parseInt(placementRes.rows[0].count);

        // Learning Progress
        const lessonsRes = await db.query('SELECT COUNT(*) as total FROM course_lessons');
        const totalLessons = parseInt(lessonsRes.rows[0].total) || 1;
        const progressRes = await db.query("SELECT COUNT(*) as completed FROM course_progress WHERE student_roll_no = $1 AND status = 'completed'", [rollNo]);
        const completedLessons = parseInt(progressRes.rows[0].completed);

        const learningScoreRes = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN activity_type = 'lesson_completed' THEN 5 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN activity_type = 'assessment_completed' THEN 10 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN activity_type = 'video_watched' THEN 3 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN activity_type = 'assignment_submitted' THEN 15 ELSE 0 END), 0) AS score,
                COUNT(id) as activity_count
            FROM learning_activity WHERE roll_no = $1
        `, [rollNo]);
        const engagementScore = learningScoreRes.rows[0].score || 0;

        // Leave requests
        const leavesRes = await db.query("SELECT * FROM leave_requests WHERE student_roll_no = $1 ORDER BY id DESC", [rollNo]);

        res.status(200).json({
            student,
            stats: { attendance: attendancePercentage, placements_applied: placementsApplied },
            learning: { completed_lessons: completedLessons, total_lessons: totalLessons, engagement_score: engagementScore },
            leaves: leavesRes.rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSchedule,
    getProjects,
    getStudents,
    getMyMentees,
    getStudentProfile,
};
