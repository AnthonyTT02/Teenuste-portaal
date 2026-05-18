const crypto = require('crypto');
const db = require('./db');

// Hash password using sha256
function hashPassword(p) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

// Check if a phone number is already taken by a different user
async function isUserPhoneTaken(phone, excludeUserId) {
  if (!phone) return false;
  let q = 'SELECT id FROM users WHERE phone = ?';
  let params = [phone];
  if (excludeUserId) {
    q += ' AND id != ?';
    params.push(excludeUserId);
  }
  const [rows] = await db.query(q, params);
  return rows.length > 0;
}

module.exports = { hashPassword, isUserPhoneTaken };
