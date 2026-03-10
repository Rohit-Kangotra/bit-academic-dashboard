const LeaveModel = require('../models/leaveModel');
const db = require('../config/db');

const applyLeave = async (req, res, next) => {
    try {
        const { leaveType, fromDate, toDate, reason, leave_type, from_date, to_date, remarks } = req.body;

        const studentRes = await db.query('SELECT roll_no, mentor_id FROM students WHERE user_id = $1', [req.user.id]);
        if (!studentRes.rows[0]) return res.status(404).json({ message: 'Student profile not found' });

        const { roll_no, mentor_id } = studentRes.rows[0];

        const data = {
            student_roll_no: roll_no,
            mentor_id: mentor_id,
            leave_type: leaveType || leave_type,
            from_date: fromDate || from_date,
            to_date: toDate || to_date,
            reason: reason || remarks
        };
        const leave = await LeaveModel.apply(data);
        res.status(201).json({ message: 'Leave requested successfully', leave });
    } catch (error) {
        next(error);
    }
};

const getPendingLeaves = async (req, res, next) => {
    try {
        let mentorId = null;
        if (req.user.role !== 'admin') {
            const facultyRes = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
            if (facultyRes.rows[0]) {
                mentorId = facultyRes.rows[0].id;
            } else {
                return res.status(200).json({ leaves: [] }); // User is logged in as faculty but has no faculty profile
            }
        }
        const leaves = await LeaveModel.getPendingLeaves(mentorId);
        res.status(200).json({ leaves });
    } catch (error) {
        next(error);
    }
};

const getStudentLeaves = async (req, res, next) => {
    try {
        const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
        if (!studentRes.rows[0]) return res.json({ leaves: [] });
        const leaves = await LeaveModel.getStudentLeaves(studentRes.rows[0].roll_no);
        res.status(200).json({ leaves });
    } catch (error) {
        next(error);
    }
};

const approveLeave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const leave = await LeaveModel.updateApproval(id, status);

        if (leave) {
            // Find student's user_id to send notification
            const studentRes = await db.query('SELECT user_id FROM students WHERE roll_no = $1', [leave.student_roll_no]);
            if (studentRes.rows.length > 0) {
                const NotificationModel = require('../models/notificationModel');
                await NotificationModel.createNotification(
                    studentRes.rows[0].user_id,
                    `Leave Request ${status}`,
                    `Your leave request for ${leave.leave_type} (${new Date(leave.from_date).toLocaleDateString()} to ${new Date(leave.to_date).toLocaleDateString()}) has been ${status.toLowerCase()}.`
                );
            }
        }

        res.status(200).json({ message: 'Leave status updated', leave });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyLeave,
    getPendingLeaves,
    getStudentLeaves,
    approveLeave,
};
