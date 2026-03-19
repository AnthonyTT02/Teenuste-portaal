<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(sql);
    console.log('Seed executed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

run();
<<<<<<< HEAD
=======
=======
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(sql);
    console.log('Seed executed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

run();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
