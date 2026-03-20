<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
const pool = require('./db');
require('dotenv').config();

async function run() {
  try {
    const dbName = process.env.DB_NAME || 'sos_narva';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `phone` already exists in users.');
      process.exit(0);
    }

    await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(100) DEFAULT NULL");
    console.log('✅ Added column `phone` to `users`.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add phone column:', err.message);
    process.exit(1);
  }
}

run();
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
const pool = require('./db');
require('dotenv').config();

async function run() {
  try {
    const dbName = process.env.DB_NAME || 'sos_narva';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `phone` already exists in users.');
      process.exit(0);
    }

    await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(100) DEFAULT NULL");
    console.log('✅ Added column `phone` to `users`.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add phone column:', err.message);
    process.exit(1);
  }
}

run();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
