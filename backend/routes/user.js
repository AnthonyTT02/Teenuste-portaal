// backend/routes/user.js defines backend API endpoints and documents validation, database access, and response behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
const router = express.Router();
// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads { isUserPhoneTaken } for this module so the code can use it below.
const { isUserPhoneTaken } = require('../utils');

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

// toPublicUser contains reusable backend logic for this module.
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
    // Executes the database query used by this route or test scenario.
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
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'Photo is required' });
    }
    if (!photo.startsWith('data:image/')) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'Photo must be an image' });
    }
    if (photo.length > 7 * 1024 * 1024) {
      // Sends the HTTP response for this validation branch or completed action.
      return res.status(400).json({ ok: false, error: 'Photo is too large' });
    }

    // Executes the database query used by this route or test scenario.
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

      // Executes the database query used by this route or test scenario.
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
        // Executes the database query used by this route or test scenario.
        [result] = await db.query('UPDATE users SET username = ?, phone = ? WHERE id = ?', [nextUsername, nextPhone, id]);
      } else if (hasUsername) {
        // Executes the database query used by this route or test scenario.
        [result] = await db.query('UPDATE users SET username = ? WHERE id = ?', [nextUsername, id]);
      } else {
        // Executes the database query used by this route or test scenario.
        [result] = await db.query('UPDATE users SET phone = ? WHERE id = ?', [nextPhone, id]);
      }

      if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ ok: false, error: 'Username already taken' });
      throw err;
    }

    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json({ ok: true, message: 'Profile updated successfully', user: toPublicUser(users[0]) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Update user language
router.put('/api/user/:id/language', async (req, res) => {
  try {
    // Executes the database query used by this route or test scenario.
    await db.query('UPDATE users SET language = ? WHERE id = ?', [req.body.language, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Check username availability
router.get('/api/check-username', async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ ok: false, available: false, error: 'username required' });
    // Executes the database query used by this route or test scenario.
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ ok: true, available: users.length === 0 });
  } catch (e) { res.status(500).json({ ok: false, available: false, error: e.message }); }
});

// Exports configuration or reusable values for Node-based tooling.
module.exports = router;
