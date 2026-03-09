const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sos_narva',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    console.log('Adding user_id column to orders table...');
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL
    `);
    console.log('✓ user_id column added to orders table');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
