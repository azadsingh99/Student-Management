const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// For Neon PostgreSQL, we don't need to create a database
// as it's already provisioned in the cloud
async function initializeDatabase() {
    try {
        // Connect directly to the Neon PostgreSQL database
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Neon PostgreSQL
            }
        });

        console.log('Connected to Neon PostgreSQL database');

        // Read and execute schema.sql
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('Database schema created successfully');

        // Close the connection
        await pool.end();
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
