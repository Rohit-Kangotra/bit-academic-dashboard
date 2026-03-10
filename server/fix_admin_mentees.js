const db = require('./config/db');

async function fixAdminMentees() {
    try {
        // 1. Get admin's user id
        const userRes = await db.query("SELECT id FROM users WHERE email = 'admin@bitsathy.ac.in'");
        if (userRes.rows.length === 0) {
            console.log("Admin user not found.");
            return;
        }
        const adminUserId = userRes.rows[0].id;
        console.log("Admin User ID:", adminUserId);

        // Get admin's exact faculty user_id = 1
        const facultyRes = await db.query("SELECT id FROM faculty WHERE user_id = $1", [adminUserId]);
        if (facultyRes.rows.length === 0) { console.log('no faculty res'); return; };

        let facultyId = facultyRes.rows[0].id;
        console.log("Admin exact Faculty ID:", facultyId);

        console.log("Admin Faculty ID:", facultyId);

        // 3. Update students 1, 2, 3 to belong to this faculty mentor
        await db.query("UPDATE students SET mentor_id = $1 WHERE id IN (1, 2, 3)", [facultyId]);
        console.log("Successfully mapped students (id 1, 2, 3) to Mentor ID", facultyId);

        // 4. Update the test leave request to also belong to this mentor
        const leaveUpdate = await db.query(
            "UPDATE leave_requests SET mentor_id = $1 WHERE student_roll_no IN (SELECT roll_no FROM students WHERE id IN (1, 2, 3))",
            [facultyId]
        );
        console.log(`Updated ${leaveUpdate.rowCount} pending leave requests to map to Mentor ID`, facultyId);

    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        process.exit(0);
    }
}

fixAdminMentees();
