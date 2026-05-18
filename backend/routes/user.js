const express = require('express');
const router = express.Router();
const db = require('../db');
const { isUserPhoneTaken } = require('../utils');

const ALLOWED_USER_STATUSES = new Set(['user', 'admin', 'moderator', 'support', 'worker']);

function getEffectiveStatus(user) {
  const status = String(user?.status || '').toLowerCase();
  const role = String(user?.role || '').toLowerCase();
  if (ALLOWED_USER_STATUSES.has(status) && status !== 'user') return status;
  if (ALLOWED_USER_STATUSES.has(role) && role !== 'user') return role;
  if (Number(user?.is_worker) === 1) return 'worker';
  return 'user';
}

function toPublicUser(user) {
  const status = getEffectiveStatus(user);
  return {
    id: user.id,
    username: user.username,
    phone: user.phone,
    email: user.email,
    role: status,
    status,
    is_worker: user.is_worker,
    worker_online: user.worker_online,
    government_name: user.government_name,
    government_surname: user.government_surname,
    language: user.language,
    profile_photo: user.profile_photo
  };
}

// Get user profile
router.get('/api/user/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, user: toPublicUser(users[0]) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update user profile photo
router.put('/api/user/:id/photo', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { photo } = req.body;

    if (!photo || typeof photo !== 'string') {
      return res.status(400).json({ ok: false, error: 'Photo is required' });
    }
    if (!photo.startsWith('data:image/')) {
      return res.status(400).json({ ok: false, error: 'Photo must be an image' });
    }
    if (photo.length > 7 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'Photo is too large' });
    }

    const [result] = await db.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photo, id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'User not found' });

    res.json({ ok: true, photo });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update user profile
router.put('/api/user/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, phone } = req.body;
    const hasUsername = username !== undefined;
    const hasPhone = phone !== undefined;
    if (!hasUsername && !hasPhone) return res.status(400).json({ ok: false, error: 'At least one field is required' });

    let nextUsername = username;
    let nextPhone = phone;

    if (hasUsername) {
      if (typeof username !== 'string') return res.status(400).json({ ok: false, error: 'Username must be a string' });
      nextUsername = username.trim();
      if (!nextUsername) return res.status(400).json({ ok: false, error: 'Username is required' });

      const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [nextUsername, id]);
      if (existingUsers.length > 0) return res.status(400).json({ ok: false, error: 'Username already taken' });
    }

    if (hasPhone) {
      nextPhone = phone || '';
      if (nextPhone && await isUserPhoneTaken(nextPhone, id)) return res.status(400).json({ ok: false, error: 'Phone already taken' });
    }

    try {
      let result;

      if (hasUsername && hasPhone) {
        [result] = await db.query('UPDATE users SET username = ?, phone = ? WHERE id = ?', [nextUsername, nextPhone, id]);
      } else if (hasUsername) {
        [result] = await db.query('UPDATE users SET username = ? WHERE id = ?', [nextUsername, id]);
      } else {
        [result] = await db.query('UPDATE users SET phone = ? WHERE id = ?', [nextPhone, id]);
      }

      if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ ok: false, error: 'Username already taken' });
      throw err;
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json({ ok: true, message: 'Profile updated successfully', user: toPublicUser(users[0]) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update user language
router.put('/api/user/:id/language', async (req, res) => {
  try {
    await db.query('UPDATE users SET language = ? WHERE id = ?', [req.body.language, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Check username availability
router.get('/api/check-username', async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ ok: false, available: false, error: 'username required' });
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ ok: true, available: users.length === 0 });
  } catch (e) { res.status(500).json({ ok: false, available: false, error: e.message }); }
});

module.exports = router;
