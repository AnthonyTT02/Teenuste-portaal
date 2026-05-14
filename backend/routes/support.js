const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a support ticket
router.post('/api/support/tickets', async (req, res) => {
  try {
    const { userId, orderId, message } = req.body;
    if (!userId || !orderId || !message) return res.status(400).json({ ok: false, error: 'userId, orderId, message required' });
    const [result] = await db.query('INSERT INTO support_tickets (user_id, order_id, message, status) VALUES (?, ?, ?, ?)', [userId, orderId, message, 'open']);
    res.json({ ok: true, ticketId: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get all support tickets
router.get('/api/support/tickets', async (req, res) => {
  try {
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
    await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', ['resolved', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;