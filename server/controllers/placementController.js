const db = require('../config/db');

// Admin APIs
const createDrive = async (req, res, next) => {
    try {
        const { company, job_role, package: pkg, eligibility_cgpa, eligible_departments, application_deadline, interview_date, location, mode } = req.body;

        const result = await db.query(`
            INSERT INTO placement_drives 
            (company, job_role, package, eligibility_cgpa, eligible_departments, application_deadline, interview_date, location, mode)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [company, job_role, pkg, eligibility_cgpa, eligible_departments, application_deadline, interview_date, location, mode]);

        res.status(201).json({ message: 'Drive created successfully', drive: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getAllDrives = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM placement_drives ORDER BY application_deadline DESC');
        res.status(200).json({ drives: rows });
    } catch (error) {
        next(error);
    }
};

const updateDrive = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { company, job_role, package: pkg, eligibility_cgpa, eligible_departments, application_deadline, interview_date, location, mode } = req.body;

        const result = await db.query(`
            UPDATE placement_drives SET 
                company=$1, job_role=$2, package=$3, eligibility_cgpa=$4, eligible_departments=$5, application_deadline=$6, interview_date=$7, location=$8, mode=$9
            WHERE id=$10 RETURNING *
        `, [company, job_role, pkg, eligibility_cgpa, eligible_departments, application_deadline, interview_date, location, mode, id]);

        res.status(200).json({ message: 'Drive updated', drive: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Student APIs
const getUpcomingDrives = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM placement_drives WHERE application_deadline >= CURRENT_DATE ORDER BY application_deadline ASC');
        res.status(200).json({ drives: rows });
    } catch (error) {
        next(error);
    }
};

const applyForDrive = async (req, res, next) => {
    try {
        const { drive_id, resume_name } = req.body;

        // Find student roll no
        const studentRes = await db.query('SELECT roll_no, cgpa, department FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student profile not found.' });

        const student = studentRes.rows[0];

        // Check eligibility constraints against the drive
        const driveRes = await db.query('SELECT * FROM placement_drives WHERE id = $1', [drive_id]);
        if (driveRes.rows.length === 0) return res.status(404).json({ message: 'Drive not found.' });

        const drive = driveRes.rows[0];

        if (parseFloat(student.cgpa) < parseFloat(drive.eligibility_cgpa)) {
            return res.status(400).json({ message: `Ineligible. Requires ${drive.eligibility_cgpa} CGPA.` });
        }

        // Prevent duplicate applications
        const existing = await db.query('SELECT * FROM placement_applications WHERE roll_no = $1 AND company = $2', [student.roll_no, drive.company]);
        if (existing.rows.length > 0) return res.status(400).json({ message: 'You have already applied.' });

        const application = await db.query(`
            INSERT INTO placement_applications (roll_no, company, resume_name, status)
            VALUES ($1, $2, $3, 'Applied') RETURNING *
        `, [student.roll_no, drive.company, resume_name]);

        res.status(201).json({ message: 'Applied successfully', application: application.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getMyApplications = async (req, res, next) => {
    try {
        const studentRes = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(200).json({ applications: [] });

        const { rows } = await db.query(`
            SELECT pa.*, pd.job_role, pd.package, pd.interview_date 
            FROM placement_applications pa
            JOIN placement_drives pd ON pa.company = pd.company
            WHERE pa.roll_no = $1
            ORDER BY pa.applied_at DESC
        `, [studentRes.rows[0].roll_no]);

        res.status(200).json({ applications: rows });
    } catch (error) {
        next(error);
    }
};

// Faculty APIs
const getStudentProgress = async (req, res, next) => {
    try {
        const { rows } = await db.query(`
            SELECT pa.*, s.name as student_name, s.department, s.cgpa
            FROM placement_applications pa
            JOIN students s ON pa.roll_no = s.roll_no
            ORDER BY pa.applied_at DESC
        `);
        res.status(200).json({ progress: rows });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDrive,
    getAllDrives,
    updateDrive,
    getUpcomingDrives,
    applyForDrive,
    getMyApplications,
    getStudentProgress,
};
