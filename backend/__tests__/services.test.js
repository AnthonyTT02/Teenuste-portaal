const request = require('supertest');
const express = require('express');
const servicesRoutes = require('../routes/services');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/', servicesRoutes);

describe('Services API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Тест: Проверяет работу маршрута вывода публичных услуг (GET /api/services).
  // Подставляет фиктивный ответ списка услуг из БД и проверяет, содержит ли ответ сервера
  // статусный код 200, и присутствует ли свойство 'services' с нужным количеством (2).
  it('GET /api/services should return list of services', async () => {
    const mockServices = [
      { id: 1, name: 'Towing', price: '50.00' },
      { id: 2, name: 'Jumpstart', price: '20.00' }
    ];
    db.query.mockResolvedValue([mockServices]);

    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('services');
    expect(res.body.services.length).toBe(2);
  });
});
