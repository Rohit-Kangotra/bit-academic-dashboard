const AttendanceModel = require('../models/attendanceModel');

// Student API
const getMyRecord = async (req, res, next) => {
    try {
        const records = await AttendanceModel.getStudentRecord(req.user.id);
        res.status(200).json({ records });
    } catch (error) {
        next(error);
    }
};

// Faculty APIs
const markAttendance = async (req, res, next) => {
    try {
        const data = { ...req.body, faculty_id: req.user.id };
        const record = await AttendanceModel.markAttendance(data);
        res.status(201).json({ message: 'Attendance marked', record });
    } catch (error) {
        next(error);
    }
};

const getClassAttendance = async (req, res, next) => {
    try {
        const { course_id, date, session_hour } = req.query;
        const records = await AttendanceModel.getClassAttendance(course_id, date, session_hour);
        res.status(200).json({ records });
    } catch (error) {
        next(error);
    }
};

// Admin APIs
const getAnalytics = async (req, res, next) => {
    try {
        const analytics = await AttendanceModel.getAnalytics();
        res.status(200).json({ analytics });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyRecord,
    markAttendance,
    getClassAttendance,
    getAnalytics,
};
