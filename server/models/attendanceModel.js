const db = require('../config/db');

class AttendanceModel {
    static async markAttendance(attendanceData) {
        const { student_id, course_id, faculty_id, date, session_hour, time_range, classroom, status } = attendanceData;
        const query = `
      INSERT INTO attendance 
      (student_id, course_id, faculty_id, date, session_hour, time_range, classroom, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
        const values = [student_id, course_id, faculty_id, date, session_hour, time_range, classroom, status];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async getStudentRecord(student_id) {
        const query = `
      SELECT a.*, c.course_name, c.course_code, u.name as faculty_name 
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      JOIN faculty f ON a.faculty_id = f.user_id
      JOIN users u ON f.user_id = u.id
      WHERE a.student_id = $1
      ORDER BY a.date DESC, a.session_hour DESC
    `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    }

    static async getClassAttendance(course_id, date, session_hour) {
        const query = `
      SELECT a.*, u.name as student_name, s.roll_number 
      FROM attendance a
      JOIN students s ON a.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE a.course_id = $1 AND a.date = $2 AND a.session_hour = $3
    `;
        const { rows } = await db.query(query, [course_id, date, session_hour]);
        return rows;
    }

    static async getAnalytics() {
        // A simplified analytics query
        const query = `
      SELECT date, status, COUNT(*) as count 
      FROM attendance 
      GROUP BY date, status 
      ORDER BY date DESC 
      LIMIT 30
    `;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = AttendanceModel;
