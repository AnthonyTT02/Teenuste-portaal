const express = require('express');
const router = express.Router();
const db = require('../db');

// Get worker application status
router.get('/api/worker/application-status/:userId', async (req, res) => {
  try {
    const [apps] = await db.query('SELECT id FROM worker_applications WHERE user_id = ? AND status = ?', [req.params.userId, 'pending']);
    res.json({ ok: true, hasPending: apps.length > 0 });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Apply to be a worker
router.post('/api/worker/apply', async (req, res) => {
  try {
    const { userId, government_name, government_surname, isikukood, bank_account, email, services } = req.body;
    if (!userId || !government_name || !government_surname || !isikukood || !bank_account || !email) {
      return res.status(400).json({ ok: false, error: 'All fields are required' });
    }
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ ok: false, error: 'Select at least one service' });
    }
    const [users] = await db.query('SELECT profile_photo FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    if (!users[0].profile_photo) {
      return res.status(400).json({ ok: false, error: 'Profile photo is required' });
    }
    const [apps] = await db.query('SELECT id FROM worker_applications WHERE user_id = ? AND status = ?', [userId, 'pending']);
    if (apps.length > 0) return res.status(400).json({ ok: false, error: 'You already have a pending application' });
    const [result] = await db.query(
      `INSERT INTO worker_applications (user_id, government_name, government_surname, isikukood, bank_account, email, services, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, government_name, government_surname, isikukood, bank_account, email, JSON.stringify(services), 'pending']
    );
    res.json({ ok: true, applicationId: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Set worker online status
router.patch('/api/worker/online', async (req, res) => {
  try {
    const { userId, isOnline } = req.body;
    if (!userId || typeof isOnline !== 'boolean') return res.status(400).json({ ok: false, error: 'userId and isOnline required' });
    await db.query('UPDATE users SET worker_online = ? WHERE id = ?', [isOnline ? 1 : 0, userId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update worker services
router.put('/api/worker/:userId/services', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { serviceIds } = req.body;
    if (!Array.isArray(serviceIds)) return res.status(400).json({ ok: false, error: 'serviceIds must be an array' });
    
    await db.query('DELETE FROM worker_services WHERE user_id = ?', [userId]);
    for (const sid of serviceIds) {
      await db.query('INSERT INTO worker_services (user_id, service_id) VALUES (?, ?)', [userId, Number(sid)]);
    }
    res.json({ ok: true, message: 'Services updated' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get online workers for a specific service
router.get('/api/workers/for-service/:serviceId', async (req, res) => {
  try {
    const [workers] = await db.query(`
      SELECT u.id, u.government_name, u.government_surname, u.phone, s.price
      FROM worker_services ws
      JOIN users u ON ws.user_id = u.id
      JOIN services s ON ws.service_id = s.id
      WHERE ws.service_id = ? AND u.is_worker = 1 AND u.worker_online = 1
    `, [req.params.serviceId]);
    const formatted = workers.map(w => ({
      id: w.id, name: w.government_name, surname: w.government_surname, phone: w.phone, price: w.price, eta: Math.floor(Math.random() * 20) + 10
    }));
    res.json({ ok: true, workers: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get worker details
router.get('/api/worker/:userId', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, phone, email, government_name, government_surname, profile_photo, is_worker, worker_online, status, role FROM users WHERE id = ?', [req.params.userId]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    
    const [services] = await db.query(`
      SELECT s.* FROM worker_services ws
      JOIN services s ON ws.service_id = s.id
      WHERE ws.user_id = ?
    `, [users[0].id]);
    res.json({ ok: true, user: users[0], services });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;
