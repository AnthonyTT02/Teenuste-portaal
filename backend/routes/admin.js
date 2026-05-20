// backend/routes/admin.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads mocked utility helpers used by authentication and user-management routes.
const { hashPassword, isUserPhoneTaken } = require('../utils');

const ALLOWED_USER_STATUSES = new Set(['user', 'admin', 'moderator', 'support', 'worker']);

// getEffectiveUserStatus loads the required data and returns it to the caller.
function getEffectiveUserStatus(user) {
  const status = String(user?.status || '').toLowerCase();
  const role = String(user?.role || '').toLowerCase();
  if (ALLOWED_USER_STATUSES.has(status) && status !== 'user') return status;
  if (ALLOWED_USER_STATUSES.has(role) && role !== 'user') return role;
  return 'user';
}

// Middleware to ensure user is admin
async function ensureAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  const uid = req.headers['x-user-id'] || req.query.userId;
  if (uid) {
    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [uid]);
    if (users.length > 0 && getEffectiveUserStatus(users[0]) === 'admin') return next();
  }
  // Sends the HTTP response for this validation branch or completed action.
  res.status(401).json({ ok: false, error: 'Not authorized' });
}

// Admin logout
router.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Get all users
router.get('/admin/users', ensureAdmin, async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT id, username, status, phone, email, is_worker FROM users ORDER BY id ASC');
    res.json({ ok: true, users });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Create user
router.post('/admin/users', ensureAdmin, async (req, res) => {
  try {
    const { username, password, status, phone } = req.body;
    const nextStatus = (status || 'user').toLowerCase();
    if (!username || !password) return res.status(400).json({ ok: false, error: 'username/password required' });
    if (!ALLOWED_USER_STATUSES.has(nextStatus)) return res.status(400).json({ ok: false, error: 'Invalid status value' });
    if (phone && await isUserPhoneTaken(phone)) return res.status(400).json({ ok: false, error: 'Этот номер телефона уже используется' });
    // Executes the database query used by this route or test scenario.
    const [result] = await db.query('INSERT INTO users (username, password, status, phone) VALUES (?, ?, ?, ?)', [username, hashPassword(password), nextStatus, phone || '']);
    res.json({ ok: true, userId: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update user
router.put('/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const p = req.body || {};
    if ('status' in p) {
      const nextStatus = String(p.status || '').toLowerCase();
      if (!ALLOWED_USER_STATUSES.has(nextStatus)) return res.status(400).json({ ok: false, error: 'Invalid status value' });
      p.status = nextStatus;
    }
    let updates = [];
    let params = [];
    ['username', 'phone', 'status'].forEach(f => {
      if (f in p) { updates.push(`${f} = ?`); params.push(p[f]); }
    });
    if ('password' in p) { updates.push('password = ?'); params.push(hashPassword(p.password)); }
    if (updates.length > 0) {
      params.push(id);
      // Executes the database query used by this route or test scenario.
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Delete user
router.delete('/admin/users/:id', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM worker_services WHERE user_id = ?', [userId]);
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM worker_applications WHERE user_id = ?', [userId]);
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM support_tickets WHERE user_id = ?', [userId]);
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM orders WHERE user_id = ?', [userId]);
    // Executes the database query used by this route or test scenario.
    await db.query('UPDATE orders SET worker_user_id = NULL WHERE worker_user_id = ?', [userId]);
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Admin stats
router.get('/api/admin/stats', ensureAdmin, async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [[usersResult]] = await db.query('SELECT COUNT(*) as c FROM users');
    // Executes the database query used by this route or test scenario.
    const [[workersResult]] = await db.query('SELECT COUNT(*) as c FROM users WHERE is_worker = 1');
    // Executes the database query used by this route or test scenario.
    const [[ordersResult]] = await db.query('SELECT COUNT(*) as c FROM orders');
    res.json({ ok: true, totalUsers: usersResult.c, activeWorkers: workersResult.c, totalOrders: ordersResult.c });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get admin services
router.get('/api/admin/services', ensureAdmin, async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [services] = await db.query('SELECT * FROM services ORDER BY id ASC');
    res.json({ ok: true, services });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Create admin service
router.post('/api/admin/services', ensureAdmin, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name) return res.status(400).json({ ok: false, error: 'name required' });
    try {
      // Executes the database query used by this route or test scenario.
      const [result] = await db.query('INSERT INTO services (name, price, description) VALUES (?, ?, ?)', [name, parseFloat(price) || 0, description || '']);
      res.json({ ok: true, service: { id: result.insertId, name, price, description } });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ ok: false, error: 'Service name already exists' });
      throw err;
    }
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update admin service
router.put('/api/admin/services/:id', ensureAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, description } = req.body;
    let updates = [];
    let params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (price !== undefined) { updates.push('price = ?'); params.push(parseFloat(price)); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (updates.length > 0) {
      params.push(id);
      // Executes the database query used by this route or test scenario.
      await db.query(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    // Executes the database query used by this route or test scenario.
    const [services] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    res.json({ ok: true, service: services[0] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Delete admin service
router.delete('/api/admin/services/:id', ensureAdmin, async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
