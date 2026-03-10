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

module.exports = {
    getSchedule,
    getProjects,
    getStudents,
    getMyMentees,
};
