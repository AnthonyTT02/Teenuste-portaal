// backend/__tests__/regression.workflow.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
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
    emails: { send: jest.fn() }
  }))
}));

// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads the auth route module that will be mounted in the test Express app.
const authRoutes = require('../routes/auth');
// Loads the admin route module that will be mounted in the test Express app.
const adminRoutes = require('../routes/admin');
// Loads the worker route module that will be mounted in the test Express app.
const workerRoutes = require('../routes/worker');
// Loads the moderator route module that will be mounted in the test Express app.
const moderatorRoutes = require('../routes/moderator');
// Loads the orders route module that will be mounted in the test Express app.
const ordersRoutes = require('../routes/orders');
// Loads the support route module that will be mounted in the test Express app.
const supportRoutes = require('../routes/support');

// buildApp prepares or runs a test scenario for this module.
function buildApp(...routes) {
  const app = express();
  app.use(express.json({ limit: '8mb' }));
  routes.forEach((route) => app.use('/', route));
  return app;
}

// findDbCall prepares or runs a test scenario for this module.
function findDbCall(fragment) {
  // Executes the database query used by this route or test scenario.
  return db.query.mock.calls.find(([sql]) => String(sql).includes(fragment));
}

// Groups tests for Regression workflow API.
describe('Regression workflow API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies that keeps the admin-service, worker approval, order, and support ticket flow intact.
  it('keeps the admin-service, worker approval, order, and support ticket flow intact', async () => {
    const app = buildApp(adminRoutes, workerRoutes, moderatorRoutes, ordersRoutes, supportRoutes);
    const adminId = 18;
    const userId = 42;
    const serviceId = 77;
    const workerApplicationId = 301;
    const orderId = 901;
    const ticketId = 1201;
    const photo = 'data:image/png;base64,iVBORw0KGgo=';

    // Executes the database query used by this route or test scenario.
    db.query
      .mockResolvedValueOnce([[{ id: adminId, status: 'admin' }]])
      .mockResolvedValueOnce([{ insertId: serviceId }])
      .mockResolvedValueOnce([[{ profile_photo: photo }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: workerApplicationId }])
      .mockResolvedValueOnce([[
        {
          id: workerApplicationId,
          user_id: userId,
          government_name: 'Regression',
          government_surname: 'Worker',
          services: JSON.stringify([serviceId])
        }
      ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ total: 1, online: 1 }]])
      .mockResolvedValueOnce([[
        {
          id: userId,
          government_name: 'Regression',
          government_surname: 'Worker',
          phone: '+3725550000',
          worker_lat: 59.377,
          worker_lng: 28.186,
          price: 49.9
        }
      ]])
      .mockResolvedValueOnce([{ insertId: orderId }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: ticketId }])
      .mockResolvedValueOnce([[{ id: ticketId, status: 'open' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: adminId, status: 'admin' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const createdService = await request(app)
      .post('/api/admin/services')
      .set('x-user-id', String(adminId))
      .send({ name: 'Regression towing', price: '49.90', description: 'Created by regression test' });
    // Asserts that the route or component produced the expected result.
    expect(createdService.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(createdService.body.service).toMatchObject({ id: serviceId, name: 'Regression towing' });

    const workerApplication = await request(app)
      .post('/api/worker/apply')
      .send({
        userId,
        government_name: 'Regression',
        government_surname: 'Worker',
        isikukood: '390010100001',
        bank_account: 'EE382200221020145685',
        email: 'worker@example.test',
        services: [serviceId]
      });
    // Asserts that the route or component produced the expected result.
    expect(workerApplication.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(workerApplication.body.applicationId).toBe(workerApplicationId);

    const approval = await request(app)
      .post(`/api/moderator/approve-application/${workerApplicationId}`)
      .send({ approve: true });
    // Asserts that the route or component produced the expected result.
    expect(approval.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(findDbCall('UPDATE users SET is_worker = 1')).toBeTruthy();
    // Asserts that the route or component produced the expected result.
    expect(findDbCall('INSERT IGNORE INTO worker_services')).toBeTruthy();

    const online = await request(app)
      .patch('/api/worker/online')
      .send({ userId, isOnline: true, lat: 59.377, lng: 28.186 });
    // Asserts that the route or component produced the expected result.
    expect(online.status).toBe(200);

    const workers = await request(app).get(`/api/workers/for-service/${serviceId}`);
    // Asserts that the route or component produced the expected result.
    expect(workers.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(workers.body.workerStats).toEqual({ total: 1, online: 1 });
    // Asserts that the route or component produced the expected result.
    expect(workers.body.workers[0]).toMatchObject({ id: userId, name: 'Regression', price: 49.9 });

    const order = await request(app)
      .post('/api/order')
      .send({
        userId: 50,
        vehicleBrand: 'Toyota',
        vehicleModel: 'Corolla',
        regNumber: '123ABC',
        services: [serviceId],
        address: 'Narva test location',
        lat: 59.377,
        lng: 28.186,
        paymentType: 'cash',
        worker_user_id: userId,
        status: 'active',
        price: 49.9,
        note: 'regression'
      });
    // Asserts that the route or component produced the expected result.
    expect(order.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(order.body.orderId).toBe(orderId);
    const orderInsert = findDbCall('INSERT INTO orders');
    // Asserts that the route or component produced the expected result.
    expect(orderInsert[1]).toEqual(expect.arrayContaining([JSON.stringify([serviceId]), userId, 'active']));

    const completed = await request(app).post(`/api/order/${orderId}/complete`);
    // Asserts that the route or component produced the expected result.
    expect(completed.status).toBe(200);

    const ticket = await request(app)
      .post('/api/support/tickets')
      .send({ userId: 50, orderId, message: 'Customer cannot reach worker' });
    // Asserts that the route or component produced the expected result.
    expect(ticket.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(ticket.body.ticketId).toBe(ticketId);

    const duplicateTicket = await request(app)
      .post('/api/support/tickets')
      .send({ userId: 50, orderId, message: 'Second ticket should be rejected' });
    // Asserts that the route or component produced the expected result.
    expect(duplicateTicket.status).toBe(409);
    // Asserts that the route or component produced the expected result.
    expect(duplicateTicket.body).toMatchObject({ alreadyExists: true, ticketId, status: 'open' });

    const resolved = await request(app).patch(`/api/support/tickets/${ticketId}/resolve`);
    // Asserts that the route or component produced the expected result.
    expect(resolved.status).toBe(200);

    const deletedService = await request(app)
      .delete(`/api/admin/services/${serviceId}`)
      .set('x-user-id', String(adminId));
    // Asserts that the route or component produced the expected result.
    expect(deletedService.status).toBe(200);
  });

  // Verifies that normalizes legacy role/status fields in login responses.
  it('normalizes legacy role/status fields in login responses', async () => {
    const app = buildApp(authRoutes);

    const cases = [
      { path: '/api/login', user: { id: 1, username: 'legacy-worker', status: 'user', is_worker: 1 }, expected: 'worker' },
      { path: '/api/admin-login', user: { id: 2, username: 'admin', role: 'admin' }, expected: 'admin' },
      { path: '/api/moderator-login', user: { id: 3, username: 'moderator', status: 'moderator' }, expected: 'moderator' },
      { path: '/api/support-login', user: { id: 4, username: 'support', role: 'support' }, expected: 'support' }
    ];

    for (const item of cases) {
      // Executes the database query used by this route or test scenario.
      db.query.mockResolvedValueOnce([[item.user]]);
      // This request calls the route under test and captures the HTTP response for assertions.
      const res = await request(app)
        .post(item.path)
        .send({ username: item.user.username, password: '1' });

      // Asserts that the route or component produced the expected result.
      expect(res.status).toBe(200);
      // Asserts that the route or component produced the expected result.
      expect(res.body).toMatchObject({
        ok: true,
        userId: item.user.id,
        status: item.expected,
        role: item.expected
      });
    }
  });
});
