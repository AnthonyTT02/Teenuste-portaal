const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLockReplacementService() {
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
    
    console.log('Adding new service "Замена замков"...');
    
    // Check if service already exists
    const [existing] = await connection.query(
      'SELECT id FROM services WHERE name = ?',
      ['Замена замков']
    );
    
    if (existing.length > 0) {
      console.log('✓ Service "Замена замков" already exists with id:', existing[0].id);
    } else {
      // Add new service
      const [result] = await connection.query(
        'INSERT INTO services (name) VALUES (?)',
        ['Замена замков']
      );
      console.log('✓ Service "Замена замков" added successfully with id:', result.insertId);
    }
    
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('Error adding service:', error.message);
    process.exit(1);
  }
}

addLockReplacementService();
