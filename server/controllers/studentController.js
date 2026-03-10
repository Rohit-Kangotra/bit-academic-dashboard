const StudentModel = require('../models/studentModel');

const getProfile = async (req, res, next) => {
    try {
        const student = await StudentModel.findByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.status(200).json({ student });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
};
