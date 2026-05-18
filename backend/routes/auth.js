const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, isUserPhoneTaken } = require('../utils');
const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification code for registration
router.post('/api/register-user/send-code', async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;
    if (!username || !password || !phone || !email) return res.status(400).json({ ok: false, error: 'Все поля обязательны' });
    if (password.length < 3) return res.status(400).json({ ok: false, error: 'Пароль должен быть минимум 3 символа' });
    if (!email.includes('@')) return res.status(400).json({ ok: false, error: 'Некорректный email' });
    if (await isUserPhoneTaken(phone)) return res.status(400).json({ ok: false, error: 'Этот номер телефона уже используется' });
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length > 0) return res.status(400).json({ ok: false, error: 'Это имя пользователя уже занято' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    req.session.pendingUser = { username, password: hashPassword(password), phone, email, code, expires: expires.toISOString() };

    console.log(`\n===========================================`);
    console.log(`ВАШ КОД ПОДТВЕРЖДЕНИЯ ДЛЯ ${email}: ${code}`);
    console.log(`===========================================\n`);

    try {
      await resend.emails.send({
        from: 'TeenustePortaal <onboarding@resend.dev>',
        to: [email],
        subject: 'Your TeenustePortaal verification code',
        html: `<div style="font-family:sans-serif;text-align:center;"><h2>${code}</h2></div>`
      });
    } catch (err) { console.error("Resend API error:", err); }

    res.json({ ok: true, message: 'Код отправлен (посмотрите в консоли сервера)' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Complete registration
router.post('/api/register-user', async (req, res) => {
  try {
    const { code } = req.body;
    const pending = req.session.pendingUser;

    if (!pending) return res.status(400).json({ ok: false, error: 'Сначала отправьте код подтверждения' });
    if (new Date() > new Date(pending.expires)) return res.status(400).json({ ok: false, error: 'Код истёк, запросите новый' });
    if (pending.code !== code) return res.status(400).json({ ok: false, error: 'Неверный код подтверждения' });
    if (await isUserPhoneTaken(pending.phone)) return res.status(400).json({ ok: false, error: 'Этот номер телефона уже используется' });

    try {
      const [result] = await db.query(
        'INSERT INTO users (username, password, phone, email, email_verified) VALUES (?, ?, ?, ?, 1)',
        [pending.username, pending.password, pending.phone, pending.email]
      );
      delete req.session.pendingUser;
      res.json({ ok: true, userId: result.insertId, message: 'Аккаунт создан успешно!' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ ok: false, error: 'Это имя пользователя уже занято' });
      throw e;
    }
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// User login
router.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Имя пользователя и пароль обязательны' });
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashPassword(password)]);
    if (users.length === 0) return res.status(401).json({ ok: false, error: 'Неправильное имя пользователя или пароль' });
    const user = users[0];
    res.json({ ok: true, userId: user.id, status: user.status || 'user', phone: user.phone || '', is_worker: user.is_worker || 0, language: user.language || 'en' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Admin login
router.post('/api/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Username and password required' });
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ? AND status = ?', [username, hashPassword(password), 'admin']);
    if (users.length === 0) return res.status(401).json({ ok: false, error: 'Invalid credentials or not an admin' });
    const user = users[0];
    res.json({ ok: true, userId: user.id });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Support login
router.post('/api/support-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Username and password required' });
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ? AND status = ?', [username, hashPassword(password), 'support']);
    if (users.length === 0) return res.status(401).json({ ok: false, error: 'Invalid credentials or not support staff' });
    const user = users[0];
    res.json({ ok: true, userId: user.id });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Moderator login
router.post('/api/moderator-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Username and password required' });
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ? AND status = ?', [username, hashPassword(password), 'moderator']);
    if (users.length === 0) return res.status(401).json({ ok: false, error: 'Invalid credentials or not a moderator' });
    const user = users[0];
    res.json({ ok: true, userId: user.id });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Send reset password code
router.post('/api/send-reset-code', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) return res.status(400).json({ ok: false, error: 'Email и имя пользователя обязательны' });

    const [users] = await db.query('SELECT id, email FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ ok: false, error: 'Пользователь с таким именем не найден' });
    if (users[0].email !== email) return res.status(400).json({ ok: false, error: 'Указанная почта не подходит для этого аккаунта' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    req.session.pendingReset = { username, email, code, expires: expires.toISOString() };

    console.log(`\n===========================================`);
    console.log(`КОД СБРОСА ПАРОЛЯ ДЛЯ ${email}: ${code}`);
    console.log(`===========================================\n`);

    try {
      await resend.emails.send({
        from: 'TeenustePortaal <onboarding@resend.dev>',
        to: [email],
        subject: 'Password Reset',
        html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f9fc;border-radius:12px;text-align:center;">
          <h1 style="color:#0f172a;margin-bottom:24px;font-size:24px;">TeenustePoraal<br><span style="color:#3b82f6;font-size:20px;">PASSWORD RESET</span></h1>
          <p style="color:#475569;margin-bottom:32px;line-height:1.6;">Use the code below to reset your password:</p>
          <div style="background:#ffffff;padding:24px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:32px;">
            <h2 style="margin:0;color:#0f172a;font-size:40px;letter-spacing:4px;font-weight:700;">${code}</h2>
          </div>
          <p style="color:#64748b;font-size:14px;margin-bottom:0;">This code expires in 10 minutes.</p>
        </div>`
      });
    } catch (err) { console.error("Resend API error:", err); }

    res.json({ ok: true, message: 'Код отправлен на почту (также посмотрите в консоли сервера)' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Reset password
router.post('/api/reset-password', async (req, res) => {
  try {
    const { email, username, code, newPassword } = req.body;
    if (!email || !username || !code || !newPassword) return res.status(400).json({ ok: false, error: 'Email, имя пользователя, код и новый пароль обязательны' });

    const pending = req.session.pendingReset;
    if (!pending || pending.username !== username || pending.email !== email) {
      return res.status(400).json({ ok: false, error: 'Сначала отправьте код подтверждения или данные не совпадают' });
    }
    if (new Date() > new Date(pending.expires)) return res.status(400).json({ ok: false, error: 'Код истёк, запросите новый' });
    if (pending.code !== code) return res.status(400).json({ ok: false, error: 'Неверный код подтверждения' });

    if (newPassword.length < 3) return res.status(400).json({ ok: false, error: 'Новый пароль должен быть минимум 3 символа' });

    const [result] = await db.query('UPDATE users SET password = ? WHERE username = ? AND email = ?', [hashPassword(newPassword), username, email]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Пользователь не найден или данные не совпадают' });

    delete req.session.pendingReset;
    res.json({ ok: true, message: 'Пароль успешно изменён' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;
