const pool = require('./db');
require('dotenv').config();

async function run() {
  try {
    const dbName = process.env.DB_NAME || 'sos_narva';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `password` already exists in users.');
      process.exit(0);
    }

    await pool.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT NULL");
    console.log('✅ Added column `password` to `users`.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add password column:', err.message);
    process.exit(1);
  }
}

run();
