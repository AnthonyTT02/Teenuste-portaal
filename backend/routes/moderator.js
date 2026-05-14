const express = require('express');
const router = express.Router();
const db = require('../db');

// Get pending worker applications
router.get('/api/moderator/pending-applications', async (req, res) => {
  try {
    const [apps] = await db.query(`
      SELECT a.*, u.username, u.phone
      FROM worker_applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
    `);
    const formatted = apps.map(a => {
      const { username, phone, ...appData } = a;
      return { ...appData, services: JSON.parse(appData.services || '[]'), user: { id: appData.user_id, username, phone } };
    });
    res.json({ ok: true, applications: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Approve or reject worker application
router.post('/api/moderator/approve-application/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { approve } = req.body;
    const [apps] = await db.query('SELECT * FROM worker_applications WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ ok: false, error: 'Application not found' });
    const application = apps[0];

    if (approve) {
      await db.query('UPDATE worker_applications SET status = ? WHERE id = ?', ['approved', id]);
      await db.query('UPDATE users SET is_worker = 1, status = ?, government_name = ?, government_surname = ? WHERE id = ?',
        ['worker', application.government_name, application.government_surname, application.user_id]);

      const serviceIds = JSON.parse(application.services || '[]');
      for (const sid of serviceIds) {
        await db.query('INSERT IGNORE INTO worker_services (user_id, service_id) VALUES (?, ?)', [application.user_id, Number(sid)]);
      }
      res.json({ ok: true, message: 'Worker approved' });
    } else {
      await db.query('UPDATE worker_applications SET status = ? WHERE id = ?', ['rejected', id]);
      res.json({ ok: true, message: 'Application rejected' });
    }
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;