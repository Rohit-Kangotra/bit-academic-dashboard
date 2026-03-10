const db = require('../config/db');

class LeaveModel {
  static async apply(leaveData) {
    const { student_roll_no, mentor_id, leave_type, from_date, to_date, reason } = leaveData;
    const query = `
      INSERT INTO leave_requests 
      (student_roll_no, mentor_id, leave_type, from_date, to_date, reason) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const values = [student_roll_no, mentor_id, leave_type, from_date, to_date, reason];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getStudentLeaves(student_roll_no) {
    const query = `
      SELECT * FROM leave_requests 
      WHERE student_roll_no = $1 
      ORDER BY id DESC
    `;
    const { rows } = await db.query(query, [student_roll_no]);
    return rows;
  }

  static async getPendingLeaves(mentor_id) {
    const query = `
      SELECT lr.*, s.name as student_name 
      FROM leave_requests lr
      LEFT JOIN students s ON lr.student_roll_no = s.roll_no
      ${mentor_id ? "WHERE lr.mentor_id = $1 AND lr.status = 'Pending'" : "WHERE lr.status = 'Pending'"}
      ORDER BY lr.id ASC
    `;
    const params = mentor_id ? [mentor_id] : [];
    const { rows } = await db.query(query, params);
    return rows;
  }

  static async updateApproval(id, status) {
    const query = `
      UPDATE leave_requests 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, id]);
    return rows[0];
  }
}

module.exports = LeaveModel;
