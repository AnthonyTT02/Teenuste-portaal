const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const db = require('../db');
const { hashPassword } = require('../utils');

jest.mock('../db');
jest.mock('../utils');

const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('Auth Routes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Тест: Проверяет валидацию при авторизации. Если логин и пароль в запросе не переданы,
  // сервер должен вернуть ошибку 400 (Bad Request).
  it('POST /api/login should return 400 for missing credentials', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });

  // Тест: При попытке входа с неверными учетными данными (если база данных возвращает пустой массив пользователей),
  // сервер должен отклонить запрос со статусом 401 (Unauthorized).
  it('POST /api/login should return 401 for incorrect password', async () => {
    db.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/login').send({ username: 'u', password: 'p' });
    expect(res.status).toBe(401);
  });
});
