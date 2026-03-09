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
    console.log('Adding employee_id and car_id columns to orders table...');
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS employee_id INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS car_id INT DEFAULT NULL
    `);
    console.log('✓ employee_id and car_id columns added to orders table');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
