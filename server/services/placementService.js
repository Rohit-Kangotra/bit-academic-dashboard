const db = require('../config/db');

class PlacementService {
    async getApplications(rollNo) {
        const query = `
            SELECT p.*, pa.status as application_status, pa.applied_at
            FROM placement_applications pa
            JOIN placement_drives p ON pa.company = p.company
            WHERE pa.roll_no = $1
            ORDER BY pa.applied_at DESC
        `;
        const { rows } = await db.query(query, [rollNo]);
        return rows;
    }

    async getApplicationCount(rollNo) {
        const query = `SELECT COUNT(*) FROM placement_applications WHERE roll_no = $1`;
        const { rows } = await db.query(query, [rollNo]);
        return parseInt(rows[0].count) || 0;
    }

    async getUpcomingDrives() {
        const query = `SELECT * FROM placement_drives WHERE date >= CURRENT_DATE ORDER BY date ASC LIMIT 5`;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = new PlacementService();
