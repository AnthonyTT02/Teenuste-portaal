// backend/__tests__/services.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the services route module that will be mounted in the test Express app.
const servicesRoutes = require('../routes/services');
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');

const app = express();
app.use(express.json());
// Handles USE requests for /.
app.use('/', servicesRoutes);

// Groups tests for Services API.
describe('Services API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test: checks the route that returns public services (GET /api/services).
  // A fake database service list is provided and the server response is checked.
  // The test expects status code 200 and a services property with the required length of 2.
  it('GET /api/services should return list of services', async () => {
    const mockServices = [
      { id: 1, name: 'Towing', price: '50.00' },
      { id: 2, name: 'Jumpstart', price: '20.00' }
    ];
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValue([mockServices]);

    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/services');
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toHaveProperty('services');
    // Asserts that the route or component produced the expected result.
    expect(res.body.services.length).toBe(2);
  });
});
