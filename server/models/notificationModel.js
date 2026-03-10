const db = require('../config/db');

class NotificationModel {
    static async createNotification(user_id, title, message) {
        const query = `
            INSERT INTO notifications (user_id, title, message)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [user_id, title, message];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getNotificationsForUser(user_id) {
        const query = `
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    static async markAsRead(id, user_id) {
        const query = `
            UPDATE notifications
            SET is_read = true
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await db.query(query, [id, user_id]);
        return result.rows[0];
    }
}

module.exports = NotificationModel;
