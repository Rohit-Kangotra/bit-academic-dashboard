require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Running schema...');
        await pool.query(sql);
        console.log('Schema executed successfully.');

        // Also seed some data
        await pool.query(`
            INSERT INTO courses (course_code, name, credits, category) VALUES 
            ('22CT601', 'Distributed Computing', 3, 'Core'),
            ('22CT602', 'Machine Learning Essentials', 4, 'Core'),
            ('22CT603', 'Cloud Computing', 3, 'Elective')
            ON CONFLICT DO NOTHING;
            
            INSERT INTO course_lessons (course_code, unit_no, topic, material_link, video_link, hours_required) VALUES
            ('22CT601', '1.1', 'Characterization of Distributed Systems', 'https://example.com/material1.pdf', 'https://youtube.com/watch?v=123', 1),
            ('22CT601', '1.2', 'System Models', 'https://example.com/material2.pdf', 'https://youtube.com/watch?v=124', 2),
            ('22CT602', '1.1', 'Introduction to ML', 'https://example.com/material3.pdf', 'https://youtube.com/watch?v=125', 1),
            ('22CT602', '1.2', 'Supervised Learning', 'https://example.com/material4.pdf', 'https://youtube.com/watch?v=126', 2)
            ON CONFLICT DO NOTHING;
        `);
        console.log('Seed data inserted.');
    } catch (error) {
        console.error('Error running schema:', error);
    } finally {
        await pool.end();
    }
}
run();
