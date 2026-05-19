const request = require('supertest');
const express = require('express');
const moderatorRoutes = require('../routes/moderator');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { moderatorId: 1 }; next(); });
app.use('/', moderatorRoutes);

describe('Moderator API', () => {
  beforeEach(() => jest.clearAllMocks());

  // Тест: Проверяет маршрут получения заявок на модерации (GET /api/moderator/pending-applications).
  // Подставляет фиктивный ответ БД с заявками (status: 'pending') и проверяет, что
  // возвращается статус 200 и ответ содержит массив заявок 'applications'.
  it('GET /api/moderator/pending-applications should return list of pending applications', async () => {
    db.query.mockResolvedValue([[{ id: 1, status: 'pending' }]]);
    const res = await request(app).get('/api/moderator/pending-applications');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('applications');
  });
});
