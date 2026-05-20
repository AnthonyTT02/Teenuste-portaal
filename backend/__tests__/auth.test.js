// backend/__tests__/auth.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the auth route module that will be mounted in the test Express app.
const authRoutes = require('../routes/auth');
// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads mocked utility helpers used by authentication and user-management routes.
const { hashPassword } = require('../utils');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');
// Replaces utility helpers with predictable mocks for password hashing and phone checks.
jest.mock('../utils');

const app = express();
app.use(express.json());
// Handles USE requests for /.
app.use('/', authRoutes);

// Groups tests for Auth Routes Tests.
describe('Auth Routes Tests', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test: checks login validation when username and password are not provided.
  // The server should return a 400 Bad Request error.
  it('POST /api/login should return 400 for missing credentials', async () => {
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).post('/api/login').send({});
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(400);
  });

  // Test: checks login with invalid credentials when the database returns an empty users array.
  // The server should reject the request with status 401 Unauthorized.
  it('POST /api/login should return 401 for incorrect password', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValue([[]]);
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).post('/api/login').send({ username: 'u', password: 'p' });
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(401);
  });
});
