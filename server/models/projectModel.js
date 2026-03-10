const db = require('../config/db');

class ProjectModel {
    static async findAll() {
        const query = `
      SELECT p.*, u.name as faculty_guide_name 
      FROM projects p
      LEFT JOIN users u ON p.faculty_guide_id = u.id
      ORDER BY p.created_at DESC
    `;
        const { rows } = await db.query(query);
        return rows;
    }

    static async findByFaculty(faculty_id) {
        const query = `
      SELECT * FROM projects 
      WHERE faculty_guide_id = $1 
      ORDER BY created_at DESC
    `;
        const { rows } = await db.query(query, [faculty_id]);
        return rows;
    }

    static async create(projectData) {
        const { title, description, faculty_guide_id } = projectData;
        const query = `
      INSERT INTO projects (title, description, faculty_guide_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
        const { rows } = await db.query(query, [title, description, faculty_guide_id]);
        return rows[0];
    }
}

module.exports = ProjectModel;
