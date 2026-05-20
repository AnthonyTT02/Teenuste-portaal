// backend/__tests__/user.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the user route module that will be mounted in the test Express app.
const userRoutes = require('../routes/user');
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { userId: 1 }; next(); });
// Handles USE requests for /.
app.use('/', userRoutes);

// Groups tests for User API.
describe('User API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => jest.clearAllMocks());

  // Test: checks the route for loading a user profile (GET /api/user/profile).
  // The database request is mocked to return fake user data.
  // The test ensures that the request returns status 200 and the profile response contains the user key.
  it('GET /api/user/profile should return user profile data', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValue([[{ id: 1, username: 'testuser', role: 'user' }]]);
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/user/profile');
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toHaveProperty('user');
  });
});
