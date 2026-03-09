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
