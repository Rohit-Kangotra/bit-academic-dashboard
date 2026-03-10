const db = require('../config/db');

class PlacementModel {
    static async create(placementData) {
        const { company_name, job_description, eligibility_criteria, min_cgpa, interview_date, interview_mode, location, created_by } = placementData;
        const query = `
      INSERT INTO placements 
      (company_name, job_description, eligibility_criteria, min_cgpa, interview_date, interview_mode, location, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
        const values = [company_name, job_description, eligibility_criteria, min_cgpa, interview_date, interview_mode, location, created_by];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findAll() {
        const { rows } = await db.query('SELECT * FROM placements ORDER BY created_at DESC');
        return rows;
    }

    static async findUpcoming() {
        const { rows } = await db.query('SELECT * FROM placements WHERE interview_date >= CURRENT_DATE ORDER BY interview_date ASC');
        return rows;
    }

    static async update(id, data) {
        // Basic dynamic update based on provided fields
        const keys = Object.keys(data);
        if (keys.length === 0) return null;

        const setQuery = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(data)];

        const query = `UPDATE placements SET ${setQuery} WHERE id = $1 RETURNING *`;
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async apply(placement_id, student_id, resume_id) {
        const query = `
      INSERT INTO placement_applications (placement_id, student_id, resume_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
        const { rows } = await db.query(query, [placement_id, student_id, resume_id]);
        return rows[0];
    }

    static async getStudentApplications(student_id) {
        const query = `
      SELECT pa.*, p.company_name, p.job_description, p.interview_date, p.interview_mode 
      FROM placement_applications pa
      JOIN placements p ON pa.placement_id = p.id
      WHERE pa.student_id = $1
    `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    }

    static async getApplicationsForDrive(placement_id) {
        const query = `
      SELECT pa.*, u.name as student_name, s.roll_number, s.cgpa, r.file_url
      FROM placement_applications pa
      JOIN students s ON pa.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN resumes r ON pa.resume_id = r.id
      WHERE pa.placement_id = $1
    `;
        const { rows } = await db.query(query, [placement_id]);
        return rows;
    }
}

module.exports = PlacementModel;
