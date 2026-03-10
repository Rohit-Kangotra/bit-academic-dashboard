const db = require('../config/db');

class CourseModel {
    static async findAll() {
        const { rows } = await db.query('SELECT * FROM courses');
        return rows;
    }

    static async findByCode(course_code) {
        const { rows } = await db.query('SELECT * FROM courses WHERE course_code = $1', [course_code]);
        return rows[0];
    }

    static async getLessons(course_code) {
        const { rows } = await db.query('SELECT * FROM course_lessons WHERE course_code = $1 ORDER BY id ASC', [course_code]);
        return rows;
    }

    static async getStudentRollNo(userId) {
        const { rows } = await db.query('SELECT roll_no FROM students WHERE user_id = $1', [userId]);
        return rows[0]?.roll_no;
    }

    static async getProgress(roll_no, course_code) {
        const { rows } = await db.query('SELECT * FROM course_progress WHERE student_roll_no = $1 AND course_code = $2', [roll_no, course_code]);
        return rows;
    }

    static async markLessonComplete(roll_no, course_code, lesson_id) {
        const query = `
            INSERT INTO course_progress (student_roll_no, course_code, lesson_id, status, completed_at)
            VALUES ($1, $2, $3, 'completed', NOW())
            ON CONFLICT (student_roll_no, course_code, lesson_id)
            DO UPDATE SET status = 'completed', completed_at = NOW()
            RETURNING *;
        `;
        const { rows } = await db.query(query, [roll_no, course_code, lesson_id]);
        return rows[0];
    }

    static async findByDepartment(department_id) {
        const { rows } = await db.query('SELECT * FROM courses WHERE department_id = $1', [department_id]);
        return rows;
    }
}

module.exports = CourseModel;
