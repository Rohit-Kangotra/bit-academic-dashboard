const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

class ExcelImportService {

    // Helper to generate email from Roll No and Name
    // Roll No Example: 7376232CT141 -> Batch: 23, Dept: CT
    generateStudentEmail(name, rollNo) {
        const cleanName = name.replace(/\s+/g, '').toLowerCase();

        let batch = '23';
        let deptCode = 'cs';

        // Attempt to extract from roll no using regex (e.g. 7376232CT141)
        const match = rollNo.match(/7376(\d{2})\d([A-Z]+)\d+/i);
        if (match) {
            batch = match[1];
            deptCode = match[2].toLowerCase();
        }

        return `${cleanName}.${deptCode}${batch}@bitsathy.ac.in`;
    }

    async previewExcel(filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

        // Grab first 10 rows
        const previewRows = rawData.slice(0, 10);

        return {
            totalRows: rawData.length,
            preview: previewRows,
            filePath: filePath // pass this back so the frontend can send it to the commit endpoint
        };
    }

    async importStudents(filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const defaultPassword = await bcrypt.hash('123', 10);
        let count = 0;

        for (const row of data) {
            const yearStr = String(row['YEAR'] || row['Year'] || "").trim();
            const rollNo = String(row['ROLL NO'] || row['Roll No'] || "").trim();
            const name = String(row['STUDENT NAME'] || row['Student Name'] || "").trim();
            const courseCode = String(row['COURSE CODE'] || row['Course Code'] || "").trim();
            const department = String(row['DEPARTMENT'] || row['Department'] || "").trim();
            const mentor = String(row['MENTOR NAME'] || row['Mentor Name'] || "").trim();
            const reward = row['CUMULATIVE REWARD POINTS'] || row['Cumulative Reward Points'] || 0;
            const redeemed = row['REDEEMED POINTS'] || row['Redeemed Points'] || 0;
            const balance = row['BALANCE POINTS'] || row['Balance Points'] || 0;

            if (!rollNo || !name) continue;

            const email = this.generateStudentEmail(name, rollNo);

            // Derive batch from roll no (e.g. 7376232CT141 -> 2023 - 2027)
            let batchStr = '';
            const rollMatch = rollNo.match(/7376(\d{2})/i);
            if (rollMatch) {
                const startYear = 2000 + parseInt(rollMatch[1]);
                batchStr = `${startYear} - ${startYear + 4}`;
            }

            // Derive semester from year (I -> 2, II -> 4, etc.)
            let semester = 1;
            if (yearStr) {
                const yearLower = String(yearStr).toLowerCase();
                if (yearLower.includes('iv') || yearLower.includes('4')) semester = 8;
                else if (yearLower.includes('iii') || yearLower.includes('3')) semester = 6;
                else if (yearLower.includes('ii') || yearLower.includes('2')) semester = 4;
                else if (yearLower.includes('i') || yearLower.includes('1')) semester = 2;
            }

            // Parse Mentor
            let mentorId = null;
            if (mentor) {
                const parts = mentor.trim().split(/\s+/);
                if (parts.length >= 3) {
                    const title = parts[0];
                    const mentorDept = parts[parts.length - 1];
                    const mentorName = parts.slice(1, parts.length - 1).join(' ');
                    const mentorEmail = `${mentorName.replace(/\s+/g, '').toLowerCase()}.${mentorDept.toLowerCase()}@bitsathy.ac.in`;

                    // Check if mentor exists
                    let mentorUserCheck = await db.query('SELECT id FROM users WHERE email = $1', [mentorEmail]);
                    if (mentorUserCheck.rows.length > 0) {
                        mentorId = mentorUserCheck.rows[0].id;
                    } else {
                        // Auto-create faculty
                        const mentorRet = await db.query(
                            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
                            [mentorEmail, defaultPassword, 'faculty']
                        );
                        mentorId = mentorRet.rows[0].id;

                        // Insert to faculty table using email prefix as a default faculty_id
                        const genFacId = `FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        await db.query(`
                            INSERT INTO faculty (user_id, faculty_id, title, name, department)
                            VALUES ($1, $2, $3, $4, $5)
                        `, [mentorId, genFacId, title, mentorName, mentorDept]);
                    }
                }
            }

            // Insert or Get User
            let userId;
            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                userId = userCheck.rows[0].id;
            } else {
                const userRes = await db.query(
                    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
                    [email, defaultPassword, 'student']
                );
                userId = userRes.rows[0].id;
            }

            // Insert or Update Student
            await db.query(`
                INSERT INTO students (user_id, roll_no, name, department, mentor_id, mentor_name, year, semester, batch, course_code, reward_points, redeemed_points, balance_points)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                ON CONFLICT (roll_no) DO UPDATE SET
                    name = EXCLUDED.name,
                    department = EXCLUDED.department,
                    mentor_id = EXCLUDED.mentor_id,
                    mentor_name = EXCLUDED.mentor_name,
                    year = EXCLUDED.year,
                    semester = EXCLUDED.semester,
                    batch = EXCLUDED.batch,
                    reward_points = EXCLUDED.reward_points,
                    redeemed_points = EXCLUDED.redeemed_points,
                    balance_points = EXCLUDED.balance_points
            `, [userId, rollNo, name, department, mentorId, mentor, yearStr, semester, batchStr, courseCode, reward, redeemed, balance]);

            count++;
        }
        return count;
    }

    async importFaculty(filePath) {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const defaultPassword = await bcrypt.hash('123', 10);
        let count = 0;

        for (const row of data) {
            const facultyId = String(row['FACULTY ID'] || "").trim();
            const name = String(row['FACULTY NAME'] || "").trim();
            const dept = String(row['DEPARTMENT'] || "").trim();
            const email = String(row['EMAIL'] || "").trim();
            const role = String(row['ROLE'] || 'faculty').trim();
            const salary = row['SALARY'] || 0;

            if (!facultyId || !email) continue;

            let userId;
            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                userId = userCheck.rows[0].id;
            } else {
                const userRes = await db.query(
                    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
                    [email, defaultPassword, 'faculty']
                );
                userId = userRes.rows[0].id;
            }

            await db.query(`
                INSERT INTO faculty (user_id, faculty_id, title, name, department, salary)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (faculty_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    department = EXCLUDED.department,
                    salary = EXCLUDED.salary
            `, [userId, facultyId, '', name, dept, salary]);
            count++;
        }
        return count;
    }

    async importAttendance(filePath) {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let count = 0;

        for (const row of data) {
            const dateVal = row['DATE'];
            const rollNo = String(row['ROLL NO'] || "").trim();
            const courseCode = String(row['COURSE CODE'] || "").trim();
            const hour = row['HOUR'];
            const status = String(row['STATUS'] || "").trim();

            if (!rollNo || !status || !dateVal) continue;

            // Excel dates might need conversion if they are numbers
            let dateStr = dateVal;
            if (typeof dateVal === 'number') {
                const jsDate = new Date((dateVal - (25567 + 2)) * 86400 * 1000);
                dateStr = jsDate.toISOString().split('T')[0];
            }

            // We don't have a unique constraint on attendance yet to do an upsert easily, just inserting
            // Alternatively we can assume we only append. For now, just insert.
            await db.query(
                'INSERT INTO attendance (date, roll_no, course_code, hour, status) VALUES ($1, $2, $3, $4, $5)',
                [dateStr, rollNo, courseCode, hour, status]
            );
            count++;
        }
        return count;
    }

    async importPlacementDrives(filePath) {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let count = 0;

        for (const row of data) {
            const company = String(row['COMPANY'] || "").trim();
            const role = String(row['JOB ROLE'] || "").trim();
            const pkg = String(row['PACKAGE'] || "").trim();
            const cgpa = row['ELIGIBILITY CGPA'] || 0;
            const departmentsStr = String(row['ELIGIBLE DEPARTMENTS'] || "").trim();
            const loc = String(row['LOCATION'] || "").trim();
            const mode = String(row['MODE'] || "").trim();

            // Convert comma-separated departments to array if provided
            const eligibleDepartments = departmentsStr ? departmentsStr.split(',').map(d => d.trim()) : [];

            // Helper to handle Excel dates safely
            const parseDate = (dateVal) => {
                if (!dateVal) return null;
                if (typeof dateVal === 'number') {
                    return new Date((dateVal - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0];
                }
                return String(dateVal).trim();
            };

            const applicationDeadline = parseDate(row['APPLICATION DEADLINE']);
            const interviewDate = parseDate(row['INTERVIEW DATE']);

            if (!company) continue;

            await db.query(`
                INSERT INTO placement_drives (
                    company, job_role, package, eligibility_cgpa, 
                    eligible_departments, application_deadline, interview_date, 
                    mode, location
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                company, role, pkg, cgpa,
                eligibleDepartments, applicationDeadline, interviewDate,
                mode, loc
            ]);
            count++;
        }
        return count;
    }
    async importPlacementApplications(filePath) {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let count = 0;

        for (const row of data) {
            const rollNo = String(row['ROLL NO'] || "").trim();
            const company = String(row['COMPANY'] || "").trim();
            const status = String(row['STATUS'] || 'Applied').trim();

            if (!rollNo || !company) continue;

            // Handle date
            let appliedAt = row['APPLIED AT'] || row['DATE'];
            if (typeof appliedAt === 'number') {
                appliedAt = new Date((appliedAt - (25567 + 2)) * 86400 * 1000).toISOString();
            } else if (!appliedAt) {
                appliedAt = new Date().toISOString();
            }

            await db.query(`
                INSERT INTO placement_applications (roll_no, company, status, applied_at)
                VALUES ($1, $2, $3, $4)
            `, [rollNo, company, status, appliedAt]);

            count++;
        }
        return count;
    }
    async importActivities(filePath) {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let count = 0;

        for (const row of data) {
            const rollNo = String(row['ROLL NO'] || "").trim();
            const activityType = String(row['ACTIVITY TYPE'] || "").trim();
            const description = String(row['DESCRIPTION'] || "").trim();
            const points = parseInt(row['POINTS'], 10) || 0;
            const status = String(row['STATUS'] || 'Pending').trim();

            if (!rollNo || !activityType) continue;

            // Using the existing 'activity_submissions' table rather than a missing 'activities' table
            await db.query(`
                INSERT INTO activity_submissions (roll_no, activity_type, description, points_requested, status)
                VALUES ($1, $2, $3, $4, $5)
            `, [rollNo, activityType, description, points, status]);

            count++;
        }
        return count;
    }
}

module.exports = new ExcelImportService();
