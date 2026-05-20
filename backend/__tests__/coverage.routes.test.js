// backend/__tests__/coverage.routes.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// coverage.routes.test.js expands backend route coverage by testing validation, happy paths, and edge cases across multiple route modules.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db', () => ({ query: jest.fn() }));
// Replaces utility helpers with predictable mocks for password hashing and phone checks.
jest.mock('../utils', () => ({
  hashPassword: jest.fn((value) => `hashed:${value}`),
  isUserPhoneTaken: jest.fn()
}));
// Replaces Resend with a fake email sender so tests never send real emails.
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({ id: 'email-1' }) }
  }))
}));

// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads mocked utility helpers used by authentication and user-management routes.
const { hashPassword, isUserPhoneTaken } = require('../utils');
// Loads the admin route module that will be mounted in the test Express app.
const adminRoutes = require('../routes/admin');
// Loads the auth route module that will be mounted in the test Express app.
const authRoutes = require('../routes/auth');
// Loads the user route module that will be mounted in the test Express app.
const userRoutes = require('../routes/user');
// Loads the worker route module that will be mounted in the test Express app.
const workerRoutes = require('../routes/worker');
// Loads the moderator route module that will be mounted in the test Express app.
const moderatorRoutes = require('../routes/moderator');
// Loads the orders route module that will be mounted in the test Express app.
const ordersRoutes = require('../routes/orders');
// Loads the support route module that will be mounted in the test Express app.
const supportRoutes = require('../routes/support');

// buildApp prepares or runs a test scenario for this module.
function buildApp(routes, session = {}) {
  const app = express();
  app.use(express.json({ limit: '8mb' }));
  app.use((req, res, next) => {
    req.session = session;
    next();
  });
  routes.forEach((route) => app.use('/', route));
  return { app, session };
}

// Groups tests for route coverage extensions.
describe('route coverage extensions', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
    // Configures the mock result used by the next request or assertion.
    isUserPhoneTaken.mockResolvedValue(false);
  });

  // Groups tests for admin routes.
  describe('admin routes', () => {
    // Verifies that rejects non-admin requests and allows header-based admins.
    it('rejects non-admin requests and allows header-based admins', async () => {
      let app = buildApp([adminRoutes]).app;
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).get('/admin/users');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(401);

      app = buildApp([adminRoutes]).app;
      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ id: 9, status: 'user', role: 'admin' }]])
        .mockResolvedValueOnce([[{ id: 1, username: 'root', status: 'admin' }]]);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/admin/users').set('x-user-id', '9');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.users).toEqual([{ id: 1, username: 'root', status: 'admin' }]);
    });

    // Verifies that validates and creates admin users.
    it('validates and creates admin users', async () => {
      const { app } = buildApp([adminRoutes], { isAdmin: true });

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/admin/users').send({ username: 'a' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/admin/users').send({ username: 'a', password: '1', status: 'owner' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Configures the mock result used by the next request or assertion.
      isUserPhoneTaken.mockResolvedValueOnce(true);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/admin/users').send({ username: 'a', password: '1', phone: '+372' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ insertId: 44 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/admin/users').send({ username: 'agent', password: '1', status: 'Support', phone: '+372555' });

      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.userId).toBe(44);
      // Asserts that the route or component produced the expected result.
      expect(hashPassword).toHaveBeenCalledWith('1');
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenLastCalledWith(
        'INSERT INTO users (username, password, status, phone) VALUES (?, ?, ?, ?)',
        ['agent', 'hashed:1', 'support', '+372555']
      );
    });

    // Verifies that updates and deletes admin users.
    it('updates and deletes admin users', async () => {
      const { app } = buildApp([adminRoutes], { isAdmin: true });

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).put('/admin/users/5').send({ status: 'invalid' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/admin/users/5').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/admin/users/5').send({ username: 'next', phone: '+372', status: 'Worker', password: 'new' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenLastCalledWith(
        'UPDATE users SET username = ?, phone = ?, status = ?, password = ? WHERE id = ?',
        ['next', '+372', 'worker', 'hashed:new', 5]
      );

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).delete('/admin/users/5');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenCalledWith('UPDATE orders SET worker_user_id = NULL WHERE worker_user_id = ?', ['5']);
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['5']);
    });

    // Verifies that covers admin services and stats paths.
    it('covers admin services and stats paths', async () => {
      const { app } = buildApp([adminRoutes], { isAdmin: true });

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ c: 3 }]])
        .mockResolvedValueOnce([[{ c: 2 }]])
        .mockResolvedValueOnce([[{ c: 7 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).get('/api/admin/stats');
      // Asserts that the route or component produced the expected result.
      expect(res.body).toMatchObject({ totalUsers: 3, activeWorkers: 2, totalOrders: 7 });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, name: 'Tow' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/admin/services');
      // Asserts that the route or component produced the expected result.
      expect(res.body.services).toEqual([{ id: 1, name: 'Tow' }]);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/admin/services').send({ price: 10 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      const duplicate = new Error('duplicate');
      duplicate.code = 'ER_DUP_ENTRY';
      // Executes the database query used by this route or test scenario.
      db.query.mockRejectedValueOnce(duplicate);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/admin/services').send({ name: 'Tow' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ insertId: 8 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/admin/services').send({ name: 'Boost', price: '12.5', description: 'Battery' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.service).toMatchObject({ id: 8, name: 'Boost' });

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ id: 8, name: 'Boost+', price: 15 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/admin/services/8').send({ name: 'Boost+', price: '15', description: 'Fast' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.service.name).toBe('Boost+');

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).delete('/api/admin/services/8');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
    });
  });

  // Groups tests for auth routes.
  describe('auth routes', () => {
    // Verifies that sends registration codes after validation.
    it('sends registration codes after validation', async () => {
      const { app, session } = buildApp([authRoutes], {});

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/register-user/send-code').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user/send-code').send({ username: 'u', password: '12', phone: '+372', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user/send-code').send({ username: 'u', password: '123', phone: '+372', email: 'bad' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Configures the mock result used by the next request or assertion.
      isUserPhoneTaken.mockResolvedValueOnce(true);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user/send-code').send({ username: 'u', password: '123', phone: '+372', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user/send-code').send({ username: 'u', password: '123', phone: '+372', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user/send-code').send({ username: 'u', password: '123', phone: '+372', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(session.pendingUser).toMatchObject({ username: 'u', password: 'hashed:123', phone: '+372', email: 'u@test.ee' });
    });

    // Verifies that completes registration with pending session state.
    it('completes registration with pending session state', async () => {
      const { app, session } = buildApp([authRoutes], {});

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/register-user').send({ code: '111111' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      session.pendingUser = { code: '111111', expires: new Date(Date.now() - 1000).toISOString() };
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user').send({ code: '111111' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      session.pendingUser = { username: 'u', password: 'hashed', phone: '+372', email: 'u@test.ee', code: '222222', expires: new Date(Date.now() + 60000).toISOString() };
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user').send({ code: 'bad' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Configures the mock result used by the next request or assertion.
      isUserPhoneTaken.mockResolvedValueOnce(true);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user').send({ code: '222222' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      const duplicate = new Error('duplicate');
      duplicate.code = 'ER_DUP_ENTRY';
      // Executes the database query used by this route or test scenario.
      db.query.mockRejectedValueOnce(duplicate);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user').send({ code: '222222' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ insertId: 12 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/register-user').send({ code: '222222' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.userId).toBe(12);
      // Asserts that the route or component produced the expected result.
      expect(session.pendingUser).toBeUndefined();
    });

    // Verifies that handles login variants and rejected staff roles.
    it('handles login variants and rejected staff roles', async () => {
      const { app } = buildApp([authRoutes]);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, username: 'w', status: 'user', is_worker: 1, language: 'et' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/login').send({ username: 'w', password: '1' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body).toMatchObject({ role: 'worker', status: 'worker', language: 'et' });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 2, username: 'regular', status: 'user' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/admin-login').send({ username: 'regular', password: '1' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(401);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/support-login').send({ username: 'support', password: 'bad' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(401);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/moderator-login').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);
    });

    // Verifies that sends and consumes password reset codes.
    it('sends and consumes password reset codes', async () => {
      const { app, session } = buildApp([authRoutes], {});

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/send-reset-code').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/send-reset-code').send({ username: 'missing', email: 'm@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, email: 'other@test.ee' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/send-reset-code').send({ username: 'u', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, email: 'u@test.ee' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/send-reset-code').send({ username: 'u', email: 'u@test.ee' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(session.pendingReset).toMatchObject({ username: 'u', email: 'u@test.ee' });

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'other@test.ee', code: session.pendingReset.code, newPassword: '123' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      session.pendingReset.expires = new Date(Date.now() - 1000).toISOString();
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'u@test.ee', code: session.pendingReset.code, newPassword: '123' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      session.pendingReset.expires = new Date(Date.now() + 60000).toISOString();
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'u@test.ee', code: 'bad', newPassword: '123' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'u@test.ee', code: session.pendingReset.code, newPassword: '12' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'u@test.ee', code: session.pendingReset.code, newPassword: '123' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/reset-password').send({ username: 'u', email: 'u@test.ee', code: session.pendingReset.code, newPassword: '123' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(session.pendingReset).toBeUndefined();
    });
  });

  // Groups tests for user routes.
  describe('user routes', () => {
    // Verifies that returns public users and validates photos.
    it('returns public users and validates photos', async () => {
      const { app } = buildApp([userRoutes]);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).get('/api/user/1');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, username: 'u', role: 'support', is_worker: 0 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/user/1');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.user.role).toBe('support');

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/photo').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/photo').send({ photo: 'text/plain;base64,abc' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/photo').send({ photo: `data:image/png;base64,${'a'.repeat(7 * 1024 * 1024)}` });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/photo').send({ photo: 'data:image/png;base64,abc' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/photo').send({ photo: 'data:image/png;base64,abc' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
    });

    // Verifies that updates profile fields and checks username availability.
    it('updates profile fields and checks username availability', async () => {
      const { app } = buildApp([userRoutes]);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).put('/api/user/1').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: 10 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: '   ' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 2 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: 'taken' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Configures the mock result used by the next request or assertion.
      isUserPhoneTaken.mockResolvedValueOnce(true);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: 'next', phone: '+372' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ id: 1, username: 'next', phone: '+372', status: 'user' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: ' next ', phone: '+372' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.user.username).toBe('next');

      const duplicate = new Error('duplicate');
      duplicate.code = 'ER_DUP_ENTRY';
      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[]])
        .mockRejectedValueOnce(duplicate);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ username: 'dupe' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([{ affectedRows: 0 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1').send({ phone: '' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/user/1/language').send({ language: 'ru' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/check-username');
      // Asserts that the route or component produced the expected result.
      expect(res.body.available).toBe(false);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/check-username?username=free');
      // Asserts that the route or component produced the expected result.
      expect(res.body.available).toBe(true);
    });
  });

  // Groups tests for worker and moderator routes.
  describe('worker and moderator routes', () => {
    // Verifies that validates worker applications and worker state updates.
    it('validates worker applications and worker state updates', async () => {
      const { app } = buildApp([workerRoutes]);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).get('/api/worker/application-status/3');
      // Asserts that the route or component produced the expected result.
      expect(res.body.hasPending).toBe(true);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({
        userId: 3, government_name: 'A', government_surname: 'B', isikukood: '390', bank_account: 'EE', email: 'a@test.ee', services: []
      });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({
        userId: 3, government_name: 'A', government_surname: 'B', isikukood: '390', bank_account: 'EE', email: 'a@test.ee', services: [1]
      });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ profile_photo: '' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({
        userId: 3, government_name: 'A', government_surname: 'B', isikukood: '390', bank_account: 'EE', email: 'a@test.ee', services: [1]
      });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ profile_photo: 'data:image/png;base64,abc' }]])
        .mockResolvedValueOnce([[{ id: 7 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({
        userId: 3, government_name: 'A', government_surname: 'B', isikukood: '390', bank_account: 'EE', email: 'a@test.ee', services: [1]
      });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ profile_photo: 'data:image/png;base64,abc' }]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 11 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/worker/apply').send({
        userId: 3, government_name: 'A', government_surname: 'B', isikukood: '390', bank_account: 'EE', email: 'a@test.ee', services: [1]
      });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/worker/online').send({ userId: 3 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/worker/online').send({ userId: 3, isOnline: true, lat: '59.37', lng: '28.18' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/worker/online').send({ userId: 3, isOnline: false, lat: 'bad', lng: 'bad' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/worker/location').send({ userId: 3, lat: 'bad', lng: 2 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/worker/location').send({ userId: 3, lat: 59.37, lng: 28.18 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
    });

    // Verifies that updates worker services and lists workers/details.
    it('updates worker services and lists workers/details', async () => {
      const { app } = buildApp([workerRoutes]);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).put('/api/worker/3/services').send({ serviceIds: 'bad' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).put('/api/worker/3/services').send({ serviceIds: [1, '2'] });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenCalledWith('INSERT INTO worker_services (user_id, service_id) VALUES (?, ?)', [3, 2]);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ total: '5', online: '2' }]])
        .mockResolvedValueOnce([[{ id: 9, government_name: 'A', government_surname: 'B', phone: '+372', worker_lat: 1, worker_lng: 2, price: 50 }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/workers/for-service/4');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.workerStats).toEqual({ total: 5, online: 2 });
      // Asserts that the route or component produced the expected result.
      expect(res.body.workers[0]).toMatchObject({ id: 9, name: 'A', surname: 'B', price: 50 });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/worker/9');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ id: 9, username: 'worker', status: 'user', is_worker: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, name: 'Tow' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/worker/9');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.user.role).toBe('worker');
      // Asserts that the route or component produced the expected result.
      expect(res.body.services).toEqual([{ id: 1, name: 'Tow' }]);
    });

    // Verifies that formats moderator applications and approve/reject paths.
    it('formats moderator applications and approve/reject paths', async () => {
      const { app } = buildApp([moderatorRoutes]);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{
        id: 2,
        user_id: 9,
        services: '[1,2]',
        username: 'candidate',
        phone: '+372',
        profile_photo: 'photo'
      }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).get('/api/moderator/pending-applications');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.applications[0]).toMatchObject({ services: [1, 2], user: { id: 9, username: 'candidate' } });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/moderator/approve-application/2').send({ approve: true });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ id: 2, user_id: 9, government_name: 'A', government_surname: 'B', services: '[1,2]' }]])
        .mockResolvedValue([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/moderator/approve-application/2').send({ approve: true });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Executes the database query used by this route or test scenario.
      expect(db.query).toHaveBeenCalledWith('INSERT IGNORE INTO worker_services (user_id, service_id) VALUES (?, ?)', [9, 2]);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[{ id: 3, user_id: 10, services: '[]' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/moderator/approve-application/3').send({ approve: false });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.message).toBe('Application rejected');
    });
  });

  // Groups tests for orders and support routes.
  describe('orders and support routes', () => {
    // Verifies that creates, fetches, completes and formats orders.
    it('creates, fetches, completes and formats orders', async () => {
      const { app } = buildApp([ordersRoutes]);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ insertId: 99 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/order').send({ services: [1, 2], userId: 5 });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.orderId).toBe(99);
      // Executes the database query used by this route or test scenario.
      expect(db.query.mock.calls[0][1]).toEqual(expect.arrayContaining([JSON.stringify([1, 2]), 5, 'active']));

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/orders/99');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 99, status: 'active' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/orders/99');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/order/99/complete');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(404);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/order/99/complete');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, government_name: 'A', government_surname: 'B', phone: '+372', status: 'active' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/user/5/orders/active?role=worker');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.orders[0].worker_user).toEqual({ government_name: 'A', government_surname: 'B', phone: '+372' });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 2, status: 'completed' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/user/5/orders/completed');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.orders[0].worker_user).toBeNull();
    });

    // Verifies that creates, checks, lists and resolves support tickets.
    it('creates, checks, lists and resolves support tickets', async () => {
      const { app } = buildApp([supportRoutes]);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      let res = await request(app).post('/api/support/tickets').send({});
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 1, status: 'open' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/support/tickets').send({ userId: 5, orderId: 9, message: 'help' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(409);

      // Executes the database query used by this route or test scenario.
      db.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 10 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).post('/api/support/tickets').send({ userId: 5, orderId: 9, message: 'help' });
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.ticketId).toBe(10);

      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/support/tickets/check');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(400);

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/support/tickets/check?userId=5&orderId=9');
      // Asserts that the route or component produced the expected result.
      expect(res.body).toMatchObject({ exists: false, status: null });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{ id: 10, status: 'resolved' }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/support/tickets/check?userId=5&orderId=9');
      // Asserts that the route or component produced the expected result.
      expect(res.body).toMatchObject({ exists: true, ticketId: 10, status: 'resolved' });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[{
        id: 10,
        user_id: 5,
        order_id: 9,
        username: 'u',
        phone: '+372',
        vehicleBrand: 'Toyota',
        services: '[1]',
        government_name: 'A',
        government_surname: 'B',
        status: 'open'
      }]]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).get('/api/support/tickets');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body.tickets[0].order.worker_user).toEqual({ government_name: 'A', government_surname: 'B' });

      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Sends a request to the in-memory Express app and stores the response for assertions.
      res = await request(app).patch('/api/support/tickets/10/resolve');
      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
    });
  });
});
