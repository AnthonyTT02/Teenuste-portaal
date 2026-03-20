<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
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
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
