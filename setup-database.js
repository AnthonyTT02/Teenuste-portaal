<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
const pool = require('./db');
const fs = require('fs');

async function runSetup() {
  try {
    console.log('Creating company_cars table...');
    
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        INDEX idx_provider (provider_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✓ Table company_cars created successfully!');
    
    
    console.log('Adding columns to providers table...');
    try {
      await pool.query(`ALTER TABLE providers ADD COLUMN carsCount INT DEFAULT NULL`);
      console.log('✓ Added carsCount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('→ carsCount column already exists');
      } else {
        throw err;
      }
    }
    
    try {
      await pool.query(`ALTER TABLE providers ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars))`);
      console.log('✓ Added companyCars column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('→ companyCars column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('\n✓✓✓ Setup completed successfully! ✓✓✓\n');
    process.exit(0);
  } catch (err) {
    console.error('\n✗✗✗ Setup error:', err.message, '\n');
    process.exit(1);
  }
}

runSetup();
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
const pool = require('./db');
const fs = require('fs');

async function runSetup() {
  try {
    console.log('Creating company_cars table...');
    
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        INDEX idx_provider (provider_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✓ Table company_cars created successfully!');
    
    
    console.log('Adding columns to providers table...');
    try {
      await pool.query(`ALTER TABLE providers ADD COLUMN carsCount INT DEFAULT NULL`);
      console.log('✓ Added carsCount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('→ carsCount column already exists');
      } else {
        throw err;
      }
    }
    
    try {
      await pool.query(`ALTER TABLE providers ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars))`);
      console.log('✓ Added companyCars column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('→ companyCars column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('\n✓✓✓ Setup completed successfully! ✓✓✓\n');
    process.exit(0);
  } catch (err) {
    console.error('\n✗✗✗ Setup error:', err.message, '\n');
    process.exit(1);
  }
}

runSetup();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
