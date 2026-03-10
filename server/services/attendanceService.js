const db = require('../config/db');

class AttendanceService {
    async getStudentAttendance(rollNo) {
        const query = `
            SELECT * FROM attendance
            WHERE roll_no = $1
            ORDER BY date DESC
        `;
        const { rows } = await db.query(query, [rollNo]);
        return rows;
    }

    async getAttendancePercentage(rollNo) {
        const query = `
            SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_classes
            FROM attendance
            WHERE roll_no = $1
        `;
        const { rows } = await db.query(query, [rollNo]);
        const total = parseInt(rows[0].total_classes) || 0;
        const present = parseInt(rows[0].present_classes) || 0;
        return total > 0 ? ((present / total) * 100).toFixed(2) : 100;
    }
}

module.exports = new AttendanceService();
