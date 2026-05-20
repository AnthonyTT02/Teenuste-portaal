// backend/__tests__/utils.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Replaces the real database connection with a Jest mock to keep tests isolated.
jest.mock('../db', () => ({ query: jest.fn() }));

// Loads the mocked database module so tests can control query results.
const db = require('../db');
// Loads mocked utility helpers used by authentication and user-management routes.
const { hashPassword, isUserPhoneTaken } = require('../utils');

// Groups tests for utils.
describe('utils', () => {
  // Resets mocks and shared state before each test case.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies that hashes passwords with sha256.
  it('hashes passwords with sha256', () => {
    // Asserts that the route or component produced the expected result.
    expect(hashPassword('secret')).toBe('2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b');
  });

  // Verifies that skips phone lookup when phone is empty.
  it('skips phone lookup when phone is empty', async () => {
    await expect(isUserPhoneTaken('', 7)).resolves.toBe(false);
    // Executes the database query used by this route or test scenario.
    expect(db.query).not.toHaveBeenCalled();
  });

  // Verifies that checks phone uniqueness with and without an excluded user.
  it('checks phone uniqueness with and without an excluded user', async () => {
    // Executes the database query used by this route or test scenario.
    db.query
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([[]]);

    await expect(isUserPhoneTaken('+3725550000')).resolves.toBe(true);
    // Executes the database query used by this route or test scenario.
    expect(db.query).toHaveBeenNthCalledWith(1, 'SELECT id FROM users WHERE phone = ?', ['+3725550000']);

    await expect(isUserPhoneTaken('+3725550001', 9)).resolves.toBe(false);
    // Executes the database query used by this route or test scenario.
    expect(db.query).toHaveBeenNthCalledWith(2, 'SELECT id FROM users WHERE phone = ? AND id != ?', ['+3725550001', 9]);
  });
});
