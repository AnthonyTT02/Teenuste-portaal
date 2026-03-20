<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
const pool = require('./db');

async function addCarsColumns() {
  try {
    console.log('Adding cars columns to providers table...');
    
    // Add carsCount column
    await pool.query(`
      ALTER TABLE providers 
      ADD COLUMN carsCount INT DEFAULT NULL
    `);
    console.log('✓ Added carsCount column');
    
    // Add companyCars column (JSON array)
    await pool.query(`
      ALTER TABLE providers 
      ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars))
    `);
    console.log('✓ Added companyCars column');
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration error:', err.message);
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist, skipping...');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

addCarsColumns();
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
const pool = require('./db');

async function addCarsColumns() {
  try {
    console.log('Adding cars columns to providers table...');
    
    // Add carsCount column
    await pool.query(`
      ALTER TABLE providers 
      ADD COLUMN carsCount INT DEFAULT NULL
    `);
    console.log('✓ Added carsCount column');
    
    // Add companyCars column (JSON array)
    await pool.query(`
      ALTER TABLE providers 
      ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars))
    `);
    console.log('✓ Added companyCars column');
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration error:', err.message);
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist, skipping...');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

addCarsColumns();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
