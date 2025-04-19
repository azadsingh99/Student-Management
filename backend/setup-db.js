const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up database tables on Neon PostgreSQL...');
  console.log('Using connection string:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:\/\/([^:]+):[^@]+@/, '://$1:********@') : 'undefined');

  try {
    // Connect to the Neon PostgreSQL database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false  
      }
    });

    console.log('Connected to Neon PostgreSQL database');
 
    const client = await pool.connect();
    
    try { 
      await client.query('BEGIN');
       
      console.log('Dropping existing tables if they exist...');
      await client.query('DROP TABLE IF EXISTS marks CASCADE');
      await client.query('DROP TABLE IF EXISTS students CASCADE');
      
      // Read and execute schema.sql
      console.log('Creating tables from schema.sql...');
      const schemaSQL = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.sql'), 'utf8');
      await client.query(schemaSQL);
      
      // Create some sample data
      console.log('Adding sample data...');
      
      // Add a few students
      const student1 = await client.query(
        'INSERT INTO students (name, email) VALUES ($1, $2) RETURNING id',
        ['John Doe', 'john@example.com']
      );
      
      const student2 = await client.query(
        'INSERT INTO students (name, email) VALUES ($1, $2) RETURNING id',
        ['Jane Smith', 'jane@example.com']
      );
      
      // Add marks for the students
      await client.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [student1.rows[0].id, 'Math', 95]
      );
      
      await client.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [student1.rows[0].id, 'Science', 88]
      );
      
      await client.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [student2.rows[0].id, 'Math', 78]
      );
      
      await client.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [student2.rows[0].id, 'Science', 92]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Database setup completed successfully!');
    } catch (error) {
      // If there's an error, roll back the transaction
      await client.query('ROLLBACK');
      console.error('Error setting up database:', error.message);
      process.exit(1);
    } finally {
      // Release the client back to the pool
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
