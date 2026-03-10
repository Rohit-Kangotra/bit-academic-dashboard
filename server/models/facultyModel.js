const db = require('../config/db');

class FacultyModel {
  static async findByUserId(userId) {
    const query = `
      SELECT f.*, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  }

  static async getSchedule(facultyId) {
    const query = `
      SELECT cs.*, c.course_name, c.course_code
      FROM class_schedule cs
      JOIN courses c ON cs.course_id = c.id
      WHERE cs.faculty_id = $1
      ORDER BY cs.day_of_week, cs.start_time
    `;
    const { rows } = await db.query(query, [facultyId]);
    return rows;
  }
}

module.exports = FacultyModel;
