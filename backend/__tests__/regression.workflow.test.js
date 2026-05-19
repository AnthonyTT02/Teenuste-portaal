const request = require('supertest');
const express = require('express');

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../utils', () => ({
  hashPassword: jest.fn((value) => `hashed:${value}`),
  isUserPhoneTaken: jest.fn()
}));
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn() }
  }))
}));

const db = require('../db');
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const workerRoutes = require('../routes/worker');
const moderatorRoutes = require('../routes/moderator');
const ordersRoutes = require('../routes/orders');
const supportRoutes = require('../routes/support');

function buildApp(...routes) {
  const app = express();
  app.use(express.json({ limit: '8mb' }));
  routes.forEach((route) => app.use('/', route));
  return app;
}

function findDbCall(fragment) {
  return db.query.mock.calls.find(([sql]) => String(sql).includes(fragment));
}

describe('Regression workflow API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the admin-service, worker approval, order, and support ticket flow intact', async () => {
    const app = buildApp(adminRoutes, workerRoutes, moderatorRoutes, ordersRoutes, supportRoutes);
    const adminId = 18;
    const userId = 42;
    const serviceId = 77;
    const workerApplicationId = 301;
    const orderId = 901;
    const ticketId = 1201;
    const photo = 'data:image/png;base64,iVBORw0KGgo=';

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
    expect(createdService.status).toBe(200);
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
    expect(workerApplication.status).toBe(200);
    expect(workerApplication.body.applicationId).toBe(workerApplicationId);

    const approval = await request(app)
      .post(`/api/moderator/approve-application/${workerApplicationId}`)
      .send({ approve: true });
    expect(approval.status).toBe(200);
    expect(findDbCall('UPDATE users SET is_worker = 1')).toBeTruthy();
    expect(findDbCall('INSERT IGNORE INTO worker_services')).toBeTruthy();

    const online = await request(app)
      .patch('/api/worker/online')
      .send({ userId, isOnline: true, lat: 59.377, lng: 28.186 });
    expect(online.status).toBe(200);

    const workers = await request(app).get(`/api/workers/for-service/${serviceId}`);
    expect(workers.status).toBe(200);
    expect(workers.body.workerStats).toEqual({ total: 1, online: 1 });
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
    expect(order.status).toBe(200);
    expect(order.body.orderId).toBe(orderId);
    const orderInsert = findDbCall('INSERT INTO orders');
    expect(orderInsert[1]).toEqual(expect.arrayContaining([JSON.stringify([serviceId]), userId, 'active']));

    const completed = await request(app).post(`/api/order/${orderId}/complete`);
    expect(completed.status).toBe(200);

    const ticket = await request(app)
      .post('/api/support/tickets')
      .send({ userId: 50, orderId, message: 'Customer cannot reach worker' });
    expect(ticket.status).toBe(200);
    expect(ticket.body.ticketId).toBe(ticketId);

    const duplicateTicket = await request(app)
      .post('/api/support/tickets')
      .send({ userId: 50, orderId, message: 'Second ticket should be rejected' });
    expect(duplicateTicket.status).toBe(409);
    expect(duplicateTicket.body).toMatchObject({ alreadyExists: true, ticketId, status: 'open' });

    const resolved = await request(app).patch(`/api/support/tickets/${ticketId}/resolve`);
    expect(resolved.status).toBe(200);

    const deletedService = await request(app)
      .delete(`/api/admin/services/${serviceId}`)
      .set('x-user-id', String(adminId));
    expect(deletedService.status).toBe(200);
  });

  it('normalizes legacy role/status fields in login responses', async () => {
    const app = buildApp(authRoutes);

    const cases = [
      { path: '/api/login', user: { id: 1, username: 'legacy-worker', status: 'user', is_worker: 1 }, expected: 'worker' },
      { path: '/api/admin-login', user: { id: 2, username: 'admin', role: 'admin' }, expected: 'admin' },
      { path: '/api/moderator-login', user: { id: 3, username: 'moderator', status: 'moderator' }, expected: 'moderator' },
      { path: '/api/support-login', user: { id: 4, username: 'support', role: 'support' }, expected: 'support' }
    ];

    for (const item of cases) {
      db.query.mockResolvedValueOnce([[item.user]]);
      const res = await request(app)
        .post(item.path)
        .send({ username: item.user.username, password: '1' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        userId: item.user.id,
        status: item.expected,
        role: item.expected
      });
    }
  });
});
