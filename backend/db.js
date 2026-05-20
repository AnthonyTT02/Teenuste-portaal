// backend/db.js configures the database connection pool used by backend route modules.
// Loads mysql for this module so the code can use it below.
const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
const url = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = pool;
