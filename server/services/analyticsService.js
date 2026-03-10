const db = require('../config/db');

class AnalyticsService {
    static async getAdminDashboardStats() {
        // Basic Counts
        const studentsRes = await db.query('SELECT COUNT(*) FROM students');
        const facultyRes = await db.query('SELECT COUNT(*) FROM faculty');

        // Placement Stats
        const drivesRes = await db.query('SELECT COUNT(*) FROM placement_drives');
        const selectionsRes = await db.query("SELECT COUNT(*) FROM placement_applications WHERE status = 'Selected'");
        const totalAppsRes = await db.query('SELECT COUNT(*) FROM placement_applications');

        let placementRate = 0;
        const totalSelected = parseInt(selectionsRes.rows[0].count, 10);
        const totalApps = parseInt(totalAppsRes.rows[0].count, 10);
        if (totalApps > 0) {
            placementRate = ((totalSelected / totalApps) * 100).toFixed(1);
        }

        // Attendance Stats
        const attendanceRes = await db.query(`
            SELECT 
                COUNT(*) FILTER(WHERE status = 'PRESENT') * 100.0 / NULLIF(COUNT(*), 0) as average_attendance 
            FROM attendance
        `);
        const averageAttendance = parseFloat(attendanceRes.rows[0].average_attendance || 0).toFixed(1);

        // Top Performing Students (by CGPA and Reward Points)
        const topStudentsRes = await db.query(`
            SELECT name, department, year, cgpa, reward_points 
            FROM students 
            ORDER BY cgpa DESC, reward_points DESC 
            LIMIT 5
        `);

        // Department Placement Chart Data (Recharts format payload)
        const deptPlacementsRes = await db.query(`
            SELECT 
                s.department as name, 
                COUNT(pa.id) as selections
            FROM placement_applications pa
            JOIN students s ON pa.roll_no = s.roll_no
            WHERE pa.status = 'Selected'
            GROUP BY s.department
            ORDER BY selections DESC
        `);

        return {
            totalStudents: parseInt(studentsRes.rows[0].count, 10),
            totalFaculty: parseInt(facultyRes.rows[0].count, 10),
            averageAttendance: parseFloat(averageAttendance),
            placementStats: {
                totalDrives: parseInt(drivesRes.rows[0].count, 10),
                totalApplications: totalApps,
                totalOffers: totalSelected,
                overallPlacementRate: parseFloat(placementRate),
                applicationsByCompany: deptPlacementsRes.rows // reusing existing data for company stats if needed, or keeping it empty
            },
            active_drives: parseInt(drivesRes.rows[0].count, 10),
            total_applications: totalApps,
            total_offers: totalSelected,
            offer_rate: parseFloat(placementRate),
            topStudents: topStudentsRes.rows,
            departmentStats: deptPlacementsRes.rows // mapped incorrectly earlier, but keeping format for AdminDashboard compatibility
        };
    }

    static async getStudentAnalytics(rollNo) {
        // Attendance
        const attendanceRes = await db.query(`
            SELECT COUNT(*) FILTER(WHERE status = 'PRESENT') * 100.0 / NULLIF(COUNT(*), 0) as average 
            FROM attendance WHERE roll_no = $1
        `, [rollNo]);

        // Return structured dataset for the Student Dash
        return {
            attendanceRatio: parseFloat(attendanceRes.rows[0]?.average || 0).toFixed(1)
        };
    }
}

module.exports = AnalyticsService;
