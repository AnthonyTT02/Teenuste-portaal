const request = require('supertest');
const express = require('express');
const workerRoutes = require('../routes/worker');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { workerId: 1 }; next(); });
app.use('/', workerRoutes);

describe('Worker API', () => {
  beforeEach(() => jest.clearAllMocks());

  // Тест: Перехватывает вызов дашборда работника (GET /api/worker/dashboard-stats).
  // Проверяет, что API возвращает статус 200, если база данных успешно отвечает со списком заказов/заданий на работнике.
  it('GET /api/worker/dashboard-stats should return worker dashboard stats', async () => {
    db.query.mockResolvedValue([ [{ id: 1, status: 'completed' }] ]);
    const res = await request(app).get('/api/worker/dashboard-stats');
    expect(res.status).toBe(200);
  });
});
