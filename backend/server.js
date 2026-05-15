const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(session({ secret: process.env.SESSION_SECRET || 'change_this', resave: false, saveUninitialized: false }));
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
});

// Import external routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const servicesRoutes = require('./routes/services');
const ordersRoutes = require('./routes/orders');
const workerRoutes = require('./routes/worker');
const moderatorRoutes = require('./routes/moderator');
const supportRoutes = require('./routes/support');

// Use routes
app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(servicesRoutes);
app.use(ordersRoutes);
app.use(workerRoutes);
app.use(moderatorRoutes);
app.use(supportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'Request body is too large' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  res.status(500).json({ ok: false, error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
