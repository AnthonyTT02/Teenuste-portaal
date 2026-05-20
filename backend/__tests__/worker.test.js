// backend/__tests__/worker.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the worker route module that will be mounted in the test Express app.
const workerRoutes = require('../routes/worker');
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { workerId: 1 }; next(); });
// Handles USE requests for /.
app.use('/', workerRoutes);

// Groups tests for Worker API.
describe('Worker API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => jest.clearAllMocks());

  // Test: intercepts the worker dashboard route call (GET /api/worker/dashboard-stats).
  // The test verifies that the API returns status 200 when the database successfully returns worker orders or tasks.
  it('GET /api/worker/dashboard-stats should return worker dashboard stats', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValue([ [{ id: 1, status: 'completed' }] ]);
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/worker/dashboard-stats');
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
  });
});
