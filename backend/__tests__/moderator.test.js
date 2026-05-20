// backend/__tests__/moderator.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');
// Loads Express to build lightweight test applications around route modules.
const express = require('express');
// Loads the moderator route module that will be mounted in the test Express app.
const moderatorRoutes = require('../routes/moderator');
// Loads the mocked database module so tests can control query results.
const db = require('../db');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.session = { moderatorId: 1 }; next(); });
// Handles USE requests for /.
app.use('/', moderatorRoutes);

// Groups tests for Moderator API.
describe('Moderator API', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => jest.clearAllMocks());

  // Test: checks the route for loading pending moderation applications (GET /api/moderator/pending-applications).
  // A fake database response with pending applications is provided and the response is checked.
  // The test expects status 200 and an applications array in the response.
  it('GET /api/moderator/pending-applications should return list of pending applications', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValue([[{ id: 1, status: 'pending' }]]);
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/moderator/pending-applications');
    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toHaveProperty('applications');
  });
});
