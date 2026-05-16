const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new order
router.post('/api/order', async (req, res) => {
  try {
    const { vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, userId, worker_user_id, status, price, note } = req.body || {};
    const [result] = await db.query(
      `INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id, worker_user_id, status, note, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleBrand || null, vehicleModel || null, regNumber || null, JSON.stringify(services || []), address || null, lat || null, lng || null, paymentType || null, userId || null, worker_user_id || null, status || 'active', note || null, price || null]
    );
    res.json({ ok: true, orderId: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get a specific order
router.get('/api/orders/:id', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, order: orders[0] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Complete an order
router.post('/api/order/:orderId/complete', async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const [result] = await db.query('UPDATE orders SET completed_at = NOW(), status = ? WHERE id = ?', ['completed', orderId]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Order not found' });
    res.json({ ok: true, message: 'Order completed successfully' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get active orders for a user
router.get('/api/user/:id/orders/active', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, w.government_name, w.government_surname, w.phone 
      FROM orders o 
      LEFT JOIN users w ON o.worker_user_id = w.id 
      WHERE o.user_id = ? AND o.status != 'completed' 
      ORDER BY o.created_at DESC
    `, [req.params.id]);

    const formatted = orders.map(o => {
      const { government_name, government_surname, phone, ...orderData } = o;
      return {
        ...orderData,
        worker_user: government_name ? { government_name, government_surname, phone } : null
      };
    });
    res.json({ ok: true, orders: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Get completed orders for a user
router.get('/api/user/:id/orders/completed', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, w.government_name, w.government_surname, w.phone 
      FROM orders o 
      LEFT JOIN users w ON o.worker_user_id = w.id 
      WHERE o.user_id = ? AND o.status = 'completed' 
      ORDER BY o.completed_at DESC
    `, [req.params.id]);

    const formatted = orders.map(o => {
      const { government_name, government_surname, phone, ...orderData } = o;
      return {
        ...orderData,
        worker_user: government_name ? { government_name, government_surname, phone } : null
      };
    });
    res.json({ ok: true, orders: formatted });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;