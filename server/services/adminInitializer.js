const bcrypt = require('bcryptjs');
const db = require('../config/db');

const initializeAdmin = async () => {
    try {
        // 1. Query database for existing admin
        const result = await db.query("SELECT * FROM users WHERE role = 'admin'");

        // 2. If no rows exist, create default admin
        if (result.rows.length === 0) {
            console.log('No default admin found. Initializing admin account...');

            const adminEmail = 'admin@bitsathy.ac.in';
            const adminPassword = '123';
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await db.query(
                "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
                [adminEmail, hashedPassword, 'admin']
            );

            console.log(`Default admin created successfully! Email: ${adminEmail}`);
        } else {
            console.log('Admin account already exists. Skipping initialization.');
        }
    } catch (error) {
        console.error('Error initializing admin account:', error.message);
    }
};

module.exports = initializeAdmin;
