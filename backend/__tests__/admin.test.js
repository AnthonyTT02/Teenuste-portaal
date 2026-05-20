// backend/__tests__/admin.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the admin route module that will be mounted in the test Express app.
const adminRoutes = require('../routes/admin');
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.session = { isAdmin: true };
  next();
});
// Handles USE requests for /.
app.use('/', adminRoutes);

// Groups tests for Admin API.
describe('Admin API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test: checks that GET /api/admin/stats returns correct administrator dashboard statistics.
  // Three database queries are mocked to return 100 users, 50 workers, and 200 orders.
  // The test expects status 200 and the totalUsers property to equal 100.
  it('GET /api/admin/stats should return dashboard statistics', async () => {
    // Executes the database query used by this route or test scenario.
    db.query
      .mockResolvedValueOnce([[{ c: 100 }]]) // users
      .mockResolvedValueOnce([[{ c: 50 }]])  // workers
      .mockResolvedValueOnce([[{ c: 200 }]]); // orders
      
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/admin/stats');
    

    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toHaveProperty('totalUsers', 100);
  });
});
