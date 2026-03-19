<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
const pool = require('./db');

async function migrate() {
  try {
    console.log('Creating company_employees table...');
    
    // Create company_employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_employees (
        id int(11) NOT NULL AUTO_INCREMENT,
        provider_id int(11) NOT NULL,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        languages json DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_provider (provider_id),
        FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✓ company_employees table created');
    
    // Drop old columns from providers if they exist
    console.log('Cleaning up providers table...');
    const columns = ['employees', 'companyCars', 'carsCount', 'smartId', 'company_login', 'company_password', 'company_phone'];
    
    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE providers DROP COLUMN ${col}`);
        console.log(`✓ Dropped column: ${col}`);
      } catch (err) {
        if (err.message.includes('Unknown column')) {
          console.log(`⚠ Column ${col} doesn't exist, skipping`);
        } else {
          throw err;
        }
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
<<<<<<< HEAD
=======
=======
const pool = require('./db');

async function migrate() {
  try {
    console.log('Creating company_employees table...');
    
    // Create company_employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_employees (
        id int(11) NOT NULL AUTO_INCREMENT,
        provider_id int(11) NOT NULL,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        languages json DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_provider (provider_id),
        FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✓ company_employees table created');
    
    // Drop old columns from providers if they exist
    console.log('Cleaning up providers table...');
    const columns = ['employees', 'companyCars', 'carsCount', 'smartId', 'company_login', 'company_password', 'company_phone'];
    
    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE providers DROP COLUMN ${col}`);
        console.log(`✓ Dropped column: ${col}`);
      } catch (err) {
        if (err.message.includes('Unknown column')) {
          console.log(`⚠ Column ${col} doesn't exist, skipping`);
        } else {
          throw err;
        }
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
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
