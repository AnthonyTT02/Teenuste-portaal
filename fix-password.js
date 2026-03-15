<<<<<<< HEAD
const pool = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixPassword() {
  try {
    const hashedPassword = hashPassword('test');
    console.log('Hashed password for "test":', hashedPassword);
    
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ? AND role = ?',
      [hashedPassword, 'Company1', 'company']
    );
    
    console.log('Updated password for Company1:', result.affectedRows, 'rows updated');
    
    // Verify
    const [rows] = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = ? AND role = ?',
      ['Company1', 'company']
    );
    
    console.log('User after update:', rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPassword();
=======
const pool = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixPassword() {
  try {
    const hashedPassword = hashPassword('test');
    console.log('Hashed password for "test":', hashedPassword);
    
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ? AND role = ?',
      [hashedPassword, 'Company1', 'company']
    );
    
    console.log('Updated password for Company1:', result.affectedRows, 'rows updated');
    
    // Verify
    const [rows] = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = ? AND role = ?',
      ['Company1', 'company']
    );
    
    console.log('User after update:', rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPassword();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
