// backend/routes/moderator.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Get pending worker applications
router.get('/api/moderator/pending-applications', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [apps] = await db.query(`
      SELECT a.*, u.username, u.phone, u.profile_photo
      FROM worker_applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
    `);
    const formatted = apps.map(a => {
      const { username, phone, profile_photo, ...appData } = a;
      return { ...appData, services: JSON.parse(appData.services || '[]'), user: { id: appData.user_id, username, phone, profile_photo } };
    });
    res.json({ ok: true, applications: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Approve or reject worker application
router.post('/api/moderator/approve-application/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { approve } = req.body;
    // Executes the database query used by this route or test scenario.
    const [apps] = await db.query('SELECT * FROM worker_applications WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ ok: false, error: 'Application not found' });
    const application = apps[0];

    if (approve) {
      // Executes the database query used by this route or test scenario.
      await db.query('UPDATE worker_applications SET status = ? WHERE id = ?', ['approved', id]);
      // Executes the database query used by this route or test scenario.
      await db.query('UPDATE users SET is_worker = 1, status = ?, government_name = ?, government_surname = ? WHERE id = ?',
        ['worker', application.government_name, application.government_surname, application.user_id]);

      const serviceIds = JSON.parse(application.services || '[]');
      for (const sid of serviceIds) {
        // Executes the database query used by this route or test scenario.
        await db.query('INSERT IGNORE INTO worker_services (user_id, service_id) VALUES (?, ?)', [application.user_id, Number(sid)]);
      }
      res.json({ ok: true, message: 'Worker approved' });
    } else {
      // Executes the database query used by this route or test scenario.
      await db.query('UPDATE worker_applications SET status = ? WHERE id = ?', ['rejected', id]);
      res.json({ ok: true, message: 'Application rejected' });
    }
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
