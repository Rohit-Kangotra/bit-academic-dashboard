const db = require('../config/db');

class StudentModel {
    static async findByUserId(userId) {
        const query = `
      SELECT s.*, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1
    `;
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }

    static async findAll() {
        const query = `
      SELECT s.*, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
    `;
        const { rows } = await db.query(query);
        return rows;
    }

    static async findByMentor(mentorId) {
        const query = `
            SELECT s.*, u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.mentor_id = $1
        `;
        const { rows } = await db.query(query, [mentorId]);
        return rows;
    }

    static async getDashboardStats() {
        const { rows } = await db.query('SELECT COUNT(*) FROM students');
        return parseInt(rows[0].count, 10);
    }
}

module.exports = StudentModel;
