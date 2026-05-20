// backend/routes/services.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// List all services
router.get('/api/services', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [services] = await db.query('SELECT * FROM services ORDER BY id ASC');
    res.json({ ok: true, services });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
