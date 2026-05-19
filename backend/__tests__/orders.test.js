const request = require('supertest');
const express = require('express');
const ordersRoutes = require('../routes/orders');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { userId: 1 }; next(); });
app.use('/', ordersRoutes);

describe('Orders API', () => {
  beforeEach(() => jest.clearAllMocks());

  // Тест: Проверяет маршрут получения заказов клиента (GET /api/orders/user).
  // Генерирует фиктивный успешный ответ базы данных с массивом заказов
  // и валидирует, что сервер отвечает статусом 200 и содержит свойство 'order'.
  it('GET /api/orders should return user orders', async () => {
    db.query.mockResolvedValue([[{ id: 1, status: 'active' }]]);
    const res = await request(app).get('/api/orders/user');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('order');
  });
});
