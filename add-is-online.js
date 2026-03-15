<<<<<<< HEAD
const pool = require('./db');

async function migrate() {
  try {
    console.log('Adding is_online columns...');
    
    // Add is_online to company_employees
    try {
      await pool.query(`
        ALTER TABLE company_employees 
        ADD COLUMN is_online BOOLEAN DEFAULT true
      `);
      console.log('✓ Added is_online to company_employees');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠ is_online already exists in company_employees');
      } else {
        throw err;
      }
    }
    
    // Add is_online to company_cars
    try {
      await pool.query(`
        ALTER TABLE company_cars 
        ADD COLUMN is_online BOOLEAN DEFAULT true
      `);
      console.log('✓ Added is_online to company_cars');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠ is_online already exists in company_cars');
      } else {
        throw err;
      }
    }
    
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
=======
const pool = require('./db');

async function migrate() {
  try {
    console.log('Adding is_online columns...');
    
    // Add is_online to company_employees
    try {
      await pool.query(`
        ALTER TABLE company_employees 
        ADD COLUMN is_online BOOLEAN DEFAULT true
      `);
      console.log('✓ Added is_online to company_employees');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠ is_online already exists in company_employees');
      } else {
        throw err;
      }
    }
    
    // Add is_online to company_cars
    try {
      await pool.query(`
        ALTER TABLE company_cars 
        ADD COLUMN is_online BOOLEAN DEFAULT true
      `);
      console.log('✓ Added is_online to company_cars');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠ is_online already exists in company_cars');
      } else {
        throw err;
      }
    }
    
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
