const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.session = { isAdmin: true };
  next();
});
app.use('/', adminRoutes);

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Тест: Проверяет, что GET /api/admin/stats возвращает корректную статистику для панели администратора.
  // Мокаются (подменяются) три запроса к базе данных, возвращающие 100 пользователей, 50 работников и 200 заказов.
  // Ожидается статус 200 и свойство totalUsers равное 100.
  it('GET /api/admin/stats should return dashboard statistics', async () => {
    db.query
      .mockResolvedValueOnce([[{ c: 100 }]]) // users
      .mockResolvedValueOnce([[{ c: 50 }]])  // workers
      .mockResolvedValueOnce([[{ c: 200 }]]); // orders
      
    const res = await request(app).get('/api/admin/stats');
    

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers', 100);
  });
});
