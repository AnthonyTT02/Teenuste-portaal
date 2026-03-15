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
