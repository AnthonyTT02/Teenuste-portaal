// backend/__tests__/server.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Loads Supertest so HTTP endpoints can be exercised without starting a real server.
const request = require('supertest');

// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db', () => ({ query: jest.fn() }));
// Replaces Resend with a fake email sender so tests never send real emails.
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn() }
  }))
}));

// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads app for this module so the code can use it below.
const app = require('../server');

// Groups tests for server app.
describe('server app', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies that returns data from mounted routes.
  it('returns data from mounted routes', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockResolvedValueOnce([[{ id: 1, name: 'Tow', price: 40 }]]);

    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/services');

    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(200);
    // Asserts that the route or component produced the expected result.
    expect(res.body.services).toEqual([{ id: 1, name: 'Tow', price: 40 }]);
  });

  // Verifies that handles invalid JSON bodies.
  it('handles invalid JSON bodies', async () => {
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send('{"username":');

    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(400);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toEqual({ ok: false, error: 'Invalid JSON' });
  });

  // Verifies that handles oversized JSON bodies.
  it('handles oversized JSON bodies', async () => {
    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ payload: 'x'.repeat(8 * 1024 * 1024 + 1) }));

    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(413);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toEqual({ ok: false, error: 'Request body is too large' });
  });

  // Verifies that normalizes unexpected route errors.
  it('normalizes unexpected route errors', async () => {
    // Executes the database query used by this route or test scenario.
    db.query.mockRejectedValueOnce(new Error('database unavailable'));

    // This request calls the route under test and captures the HTTP response for assertions.
    const res = await request(app).get('/api/services');

    // Asserts that the route or component produced the expected result.
    expect(res.status).toBe(500);
    // Asserts that the route or component produced the expected result.
    expect(res.body).toEqual({ ok: false, error: 'database unavailable' });
  });
});
