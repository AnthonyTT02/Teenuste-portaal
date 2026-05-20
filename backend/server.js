// backend/server.js configures the Express server, middleware, sessions, route mounting, and startup behavior.
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
require('dotenv').config();
// Loads session for this module so the code can use it below.
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(session({ secret: process.env.SESSION_SECRET || 'change_this', resave: false, saveUninitialized: false }));
app.use(express.json({ limit: '8mb' }));

// Import external routes
const authRoutes = require('./routes/auth');
// Loads the admin route module that will be mounted in the test Express app.
const adminRoutes = require('./routes/admin');
// Loads the user route module that will be mounted in the test Express app.
const userRoutes = require('./routes/user');
// Loads the services route module that will be mounted in the test Express app.
const servicesRoutes = require('./routes/services');
// Loads the orders route module that will be mounted in the test Express app.
const ordersRoutes = require('./routes/orders');
// Loads the worker route module that will be mounted in the test Express app.
const workerRoutes = require('./routes/worker');
// Loads the moderator route module that will be mounted in the test Express app.
const moderatorRoutes = require('./routes/moderator');
// Loads the support route module that will be mounted in the test Express app.
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
  // Sends the HTTP response for this validation branch or completed action.
  res.status(500).json({ ok: false, error: err.message || 'Server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Exports configuration or reusable values for Node-based tooling.
module.exports = app;
