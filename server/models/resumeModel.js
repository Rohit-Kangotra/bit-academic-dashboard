const db = require('../config/db');

class ResumeModel {
    static async uploadResume(student_id, file_url) {
        // If setting as primary, we might want to unset others first
        // For simplicity, just inserting here
        const query = `
      INSERT INTO resumes (student_id, file_url, is_primary) 
      VALUES ($1, $2, true) 
      RETURNING *
    `;
        const { rows } = await db.query(query, [student_id, file_url]);
        return rows[0];
    }

    static async getResumes(student_id) {
        const query = `
      SELECT * FROM resumes 
      WHERE student_id = $1 
      ORDER BY uploaded_at DESC
    `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    }
}

module.exports = ResumeModel;
