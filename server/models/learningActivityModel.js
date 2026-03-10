const db = require('../config/db');

class LearningActivityModel {
    static async createActivity(roll_no, course_code, activity_type) {
        const query = `
            INSERT INTO learning_activity (roll_no, course_code, activity_type)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [roll_no, course_code, activity_type];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getFacultyLearningAnalytics(facultyId) {
        const query = `
            SELECT 
                s.roll_no, 
                s.name, 
                COUNT(a.id) AS activity_count,
                COALESCE(SUM(CASE WHEN a.activity_type = 'lesson_completed' THEN 5 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN a.activity_type = 'assessment_completed' THEN 10 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN a.activity_type = 'video_watched' THEN 3 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN a.activity_type = 'assignment_submitted' THEN 15 ELSE 0 END), 0) AS engagement_score
            FROM students s
            LEFT JOIN learning_activity a ON s.roll_no = a.roll_no
            WHERE s.mentor_id = $1
            GROUP BY s.roll_no, s.name
        `;
        const result = await db.query(query, [facultyId]);
        return result.rows;
    }
}

module.exports = LearningActivityModel;
