const db = require('../config/db');

class StudentService {
    async getProfile(userId) {
        const query = `
            SELECT s.*, u.email, u.role
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.id = $1
        `;
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }
}

module.exports = new StudentService();
