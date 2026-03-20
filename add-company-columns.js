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
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `role` already exists in users.');
    } else {
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'user'");
      console.log('✅ Added column `role` to `users`.');
    }

    const [rows2] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'provider_id'`,
      [dbName]
    );

    if (rows2 && rows2.length > 0) {
      console.log('Column `provider_id` already exists in users.');
    } else {
      await pool.query('ALTER TABLE users ADD COLUMN provider_id INT DEFAULT NULL');
      console.log('✅ Added column `provider_id` to `users`.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add company columns:', err.message);
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
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
      [dbName]
    );

    if (rows && rows.length > 0) {
      console.log('Column `role` already exists in users.');
    } else {
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'user'");
      console.log('✅ Added column `role` to `users`.');
    }

    const [rows2] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'provider_id'`,
      [dbName]
    );

    if (rows2 && rows2.length > 0) {
      console.log('Column `provider_id` already exists in users.');
    } else {
      await pool.query('ALTER TABLE users ADD COLUMN provider_id INT DEFAULT NULL');
      console.log('✅ Added column `provider_id` to `users`.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add company columns:', err.message);
    process.exit(1);
  }
}

run();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
