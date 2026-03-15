<<<<<<< HEAD
const pool = require('./db');
require('dotenv').config();

async function run() {
  try {
    const dbName = process.env.DB_NAME || 'sos_narva';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `email` already exists in users.');
      process.exit(0);
    }

    await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL");
    console.log('✅ Added column `email` to `users`.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add email column:', err.message);
    process.exit(1);
  }
}

run();
=======
const pool = require('./db');
require('dotenv').config();

async function run() {
  try {
    const dbName = process.env.DB_NAME || 'sos_narva';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `email` already exists in users.');
      process.exit(0);
    }

    await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL");
    console.log('✅ Added column `email` to `users`.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add email column:', err.message);
    process.exit(1);
  }
}

run();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
