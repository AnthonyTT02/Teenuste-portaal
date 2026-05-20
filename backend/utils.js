// backend/utils.js contains project logic or configuration with inline comments for maintainability.
// Loads crypto for this module so the code can use it below.
const crypto = require('crypto');
// Loads the mocked database module so tests can control query results.
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
  // Executes the database query used by this route or test scenario.
  const [rows] = await db.query(q, params);
  return rows.length > 0;
}

// Exports configuration or reusable values for Node-based tooling.
module.exports = { hashPassword, isUserPhoneTaken };
