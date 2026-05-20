// backend/routes/worker.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');

const ALLOWED_USER_STATUSES = new Set(['user', 'admin', 'moderator', 'support', 'worker']);

// getEffectiveStatus loads the required data and returns it to the caller.
function getEffectiveStatus(user) {
  const status = String(user?.status || '').toLowerCase();
  const role = String(user?.role || '').toLowerCase();
  if (ALLOWED_USER_STATUSES.has(status) && status !== 'user') return status;
  if (ALLOWED_USER_STATUSES.has(role) && role !== 'user') return role;
  if (Number(user?.is_worker) === 1) return 'worker';
  return 'user';
}

// toWorkerUser contains reusable backend logic for this module.
function toWorkerUser(user) {
  const status = getEffectiveStatus(user);
  return {
    id: user.id,
    username: user.username,
    phone: user.phone,
    email: user.email,
    government_name: user.government_name,
    government_surname: user.government_surname,
    profile_photo: user.profile_photo,
    worker_lat: user.worker_lat,
    worker_lng: user.worker_lng,
    is_worker: user.is_worker,
    worker_online: user.worker_online,
    status,
    role: status
  };
}

// Get worker application status
router.get('/api/worker/application-status/:userId', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [apps] = await db.query('SELECT id FROM worker_applications WHERE user_id = ? AND status = ?', [req.params.userId, 'pending']);
    res.json({ ok: true, hasPending: apps.length > 0 });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Apply to be a worker
router.post('/api/worker/apply', async (req, res) => {
  try {
    const { userId, government_name, government_surname, isikukood, bank_account, email, services } = req.body;
    if (!userId || !government_name || !government_surname || !isikukood || !bank_account || !email) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'All fields are required' });
    }
    if (!services || !Array.isArray(services) || services.length === 0) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'Select at least one service' });
    }
    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT profile_photo FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    if (!users[0].profile_photo) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'Profile photo is required' });
    }
    // Executes the database query used by this route or test scenario.
    const [apps] = await db.query('SELECT id FROM worker_applications WHERE user_id = ? AND status = ?', [userId, 'pending']);
    if (apps.length > 0) return res.status(400).json({ ok: false, error: 'You already have a pending application' });
    // Executes the database query used by this route or test scenario.
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
    const { userId, isOnline, lat, lng } = req.body;
    if (!userId || typeof isOnline !== 'boolean') return res.status(400).json({ ok: false, error: 'userId and isOnline required' });
    const workerLat = Number(lat);
    const workerLng = Number(lng);

    if (Number.isFinite(workerLat) && Number.isFinite(workerLng)) {
      // Executes the database query used by this route or test scenario.
      await db.query('UPDATE users SET worker_online = ?, worker_lat = ?, worker_lng = ? WHERE id = ?', [isOnline ? 1 : 0, workerLat, workerLng, userId]);
    } else {
      // Executes the database query used by this route or test scenario.
      await db.query('UPDATE users SET worker_online = ? WHERE id = ?', [isOnline ? 1 : 0, userId]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update worker location while online
router.patch('/api/worker/location', async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;
    const workerLat = Number(lat);
    const workerLng = Number(lng);

    if (!userId || !Number.isFinite(workerLat) || !Number.isFinite(workerLng)) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'userId, lat and lng required' });
    }

    // Executes the database query used by this route or test scenario.
    await db.query('UPDATE users SET worker_lat = ?, worker_lng = ? WHERE id = ? AND worker_online = 1', [workerLat, workerLng, userId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update worker services
router.put('/api/worker/:userId/services', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { serviceIds } = req.body;
    if (!Array.isArray(serviceIds)) return res.status(400).json({ ok: false, error: 'serviceIds must be an array' });
    
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM worker_services WHERE user_id = ?', [userId]);
    for (const sid of serviceIds) {
      // Executes the database query used by this route or test scenario.
      await db.query('INSERT INTO worker_services (user_id, service_id) VALUES (?, ?)', [userId, Number(sid)]);
    }
    res.json({ ok: true, message: 'Services updated' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get online workers for a specific service
router.get('/api/workers/for-service/:serviceId', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [[stats]] = await db.query(`
      SELECT
        COUNT(DISTINCT ws.user_id) AS total,
        COUNT(DISTINCT CASE WHEN u.worker_online = 1 THEN ws.user_id END) AS online
      FROM worker_services ws
      JOIN users u ON ws.user_id = u.id
      WHERE ws.service_id = ? AND u.is_worker = 1
    `, [req.params.serviceId]);

    // Executes the database query used by this route or test scenario.
    const [workers] = await db.query(`
      SELECT u.id, u.government_name, u.government_surname, u.phone, u.worker_lat, u.worker_lng, s.price
      FROM worker_services ws
      JOIN users u ON ws.user_id = u.id
      JOIN services s ON ws.service_id = s.id
      WHERE ws.service_id = ? AND u.is_worker = 1 AND u.worker_online = 1
    `, [req.params.serviceId]);
    const formatted = workers.map(w => ({
      id: w.id, name: w.government_name, surname: w.government_surname, phone: w.phone, lat: w.worker_lat, lng: w.worker_lng, price: w.price, eta: Math.floor(Math.random() * 20) + 10
    }));
    res.json({
      ok: true,
      workers: formatted,
      workerStats: {
        total: Number(stats?.total || 0),
        online: Number(stats?.online || 0)
      }
    });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get worker details
router.get('/api/worker/:userId', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.userId]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    
    // Executes the database query used by this route or test scenario.
    const [services] = await db.query(`
      SELECT s.* FROM worker_services ws
      JOIN services s ON ws.service_id = s.id
      WHERE ws.user_id = ?
    `, [users[0].id]);
    res.json({ ok: true, user: toWorkerUser(users[0]), services });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
