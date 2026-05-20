// backend/routes/support.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Create a support ticket
router.post('/api/support/tickets', async (req, res) => {
  try {
    const { userId, orderId, message } = req.body;
    if (!userId || !orderId || !message) return res.status(400).json({ ok: false, error: 'userId, orderId, message required' });

    // Executes the database query used by this route or test scenario.
    const [existing] = await db.query(
      'SELECT id, status FROM support_tickets WHERE user_id = ? AND order_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId, orderId]
    );

    if (existing.length) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(409).json({ ok: false, alreadyExists: true, ticketId: existing[0].id, status: existing[0].status });
    }

    // Executes the database query used by this route or test scenario.
    const [result] = await db.query('INSERT INTO support_tickets (user_id, order_id, message, status) VALUES (?, ?, ?, ?)', [userId, orderId, message, 'open']);
    res.json({ ok: true, ticketId: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Check if a support ticket already exists for an order
router.get('/api/support/tickets/check', async (req, res) => {
  try {
    const { userId, orderId } = req.query;
    if (!userId || !orderId) return res.status(400).json({ ok: false, error: 'userId and orderId required' });

    // Executes the database query used by this route or test scenario.
    const [rows] = await db.query(
      'SELECT id, status FROM support_tickets WHERE user_id = ? AND order_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId, orderId]
    );

    if (!rows.length) return res.json({ ok: true, exists: false, status: null });
    res.json({ ok: true, exists: true, ticketId: rows[0].id, status: rows[0].status });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get all support tickets
router.get('/api/support/tickets', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    const [tickets] = await db.query(`
      SELECT t.*, u.username, u.phone, o.vehicleBrand, o.services, w.government_name, w.government_surname
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      JOIN orders o ON t.order_id = o.id
      LEFT JOIN users w ON o.worker_user_id = w.id
      ORDER BY t.created_at DESC
    `);
    const formatted = tickets.map(t => {
      const { username, phone, vehicleBrand, services, government_name, government_surname, ...ticketData } = t;
      return {
        ...ticketData,
        user: { id: t.user_id, username, phone },
        order: { id: t.order_id, vehicleBrand, services, worker_user: government_name ? { government_name, government_surname } : null }
      };
    });
    res.json({ ok: true, tickets: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Resolve a support ticket
router.patch('/api/support/tickets/:id/resolve', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', ['resolved', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
