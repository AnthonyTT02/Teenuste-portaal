<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
const pool = require('./db');

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Удалить старую таблицу if exists
    console.log('Dropping old tables if they exist...');
    try {
      await pool.query('DROP TABLE IF EXISTS email_confirmations');
      console.log('✓ Dropped email_confirmations');
    } catch (e) {}
    
    try {
      await pool.query('DROP TABLE IF EXISTS users');
      console.log('✓ Dropped users');
    } catch (e) {}
    
    // Создать новую таблицу users с колонкой phone
    console.log('Creating new users table...');
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Users table created with phone column');
    
    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

runMigration();
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
const pool = require('./db');

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Удалить старую таблицу if exists
    console.log('Dropping old tables if they exist...');
    try {
      await pool.query('DROP TABLE IF EXISTS email_confirmations');
      console.log('✓ Dropped email_confirmations');
    } catch (e) {}
    
    try {
      await pool.query('DROP TABLE IF EXISTS users');
      console.log('✓ Dropped users');
    } catch (e) {}
    
    // Создать новую таблицу users с колонкой phone
    console.log('Creating new users table...');
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Users table created with phone column');
    
    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

runMigration();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
