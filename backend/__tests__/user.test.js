const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/user');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { userId: 1 }; next(); });
app.use('/', userRoutes);

describe('User API', () => {
  beforeEach(() => jest.clearAllMocks());

  // Тест: Проверяет маршрут получения профиля пользователя (GET /api/user/profile).
  // Подменяет запрос в БД на возврат фиктивных данных пользователя и гарантирует,
  // что запрос возвращает статус 200 и объект профиля содержит ключ 'user'.
  it('GET /api/user/profile should return user profile data', async () => {
    db.query.mockResolvedValue([[{ id: 1, username: 'testuser', role: 'user' }]]);
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
  });
});
