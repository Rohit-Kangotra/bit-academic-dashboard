const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const allowedDomain = process.env.ALLOWED_DOMAIN || '@bitsathy.ac.in';

        if (!email.endsWith(allowedDomain)) {
            return res.status(403).json({ message: `Access restricted to ${allowedDomain} domain only` });
        }

        // Check if user exists in db
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT payload
        const payload = {
            id: user.id, // This is users.id
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Fetch user profile if student
        let profile = { id: user.id, email: user.email, role: user.role };

        if (user.role === 'student') {
            const studentResult = await db.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
            if (studentResult.rows[0]) {
                profile = { ...profile, ...studentResult.rows[0], name: studentResult.rows[0].name };
            }
        } else if (user.role === 'faculty') {
            const facultyResult = await db.query('SELECT * FROM faculty WHERE user_id = $1', [user.id]);
            if (facultyResult.rows[0]) {
                profile = { ...profile, ...facultyResult.rows[0], name: facultyResult.rows[0].name };
            }
        }

        res.status(200).json({
            message: 'Login successful',
            token,
            user: profile
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
};
