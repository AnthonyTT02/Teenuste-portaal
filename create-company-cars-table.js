const pool = require('./db');

async function createCompanyCarsTable() {
  try {
    console.log('Creating company_cars table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    console.log('✓ Table company_cars created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error creating table:', err.message);
    process.exit(1);
  }
}

createCompanyCarsTable();
