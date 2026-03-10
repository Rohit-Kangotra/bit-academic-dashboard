const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runSchema() {
    try {
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaQuery = fs.readFileSync(schemaPath, { encoding: 'utf8' });

        console.log('Executing schema.sql...');
        await db.query(schemaQuery);

        console.log('Schema applied successfully.');
    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        process.exit();
    }
}

runSchema();
