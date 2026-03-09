const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeEmailColumn() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sos_narva',
    multipleStatements: true,
    timezone: 'Z'
  });

  try {
    const connection = await pool.getConnection();
    
    console.log('Removing email column from users table...');
    
    // Drop the email column
    await connection.query('ALTER TABLE `users` DROP COLUMN `email`');
    
    console.log('✓ Email column successfully removed from users table');
    
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('Error removing email column:', error.message);
    process.exit(1);
  }
}

removeEmailColumn();
