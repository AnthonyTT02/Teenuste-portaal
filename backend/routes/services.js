const express = require('express');
const router = express.Router();
const db = require('../db');

// List all services
router.get('/api/services', async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services ORDER BY id ASC');
    res.json({ ok: true, services });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;