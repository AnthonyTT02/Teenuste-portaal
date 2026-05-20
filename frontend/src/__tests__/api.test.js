// frontend/src/__tests__/api.test.js contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Imports test helpers used to render components, simulate users, and assert behavior.
import { describe, expect, it, vi } from 'vitest';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';

// mockResponse prepares or runs a test scenario for this module.
function mockResponse({ ok = true, status = 200, body = '' } = {}) {
  return {
    ok,
    status,
    text: vi.fn().mockResolvedValue(body)
  };
}

// Groups tests for api wrapper.
describe('api wrapper', () => {
  // Verifies that adds credentials and JSON headers, then returns parsed payloads.
  it('adds credentials and JSON headers, then returns parsed payloads', async () => {
    const response = mockResponse({ body: JSON.stringify({ ok: true, value: 7 }) });
    global.fetch = vi.fn().mockResolvedValue(response);

    await expect(api('/api/example', { method: 'POST', headers: { 'X-Test': '1' }, body: '{}' })).resolves.toEqual({ ok: true, value: 7 });

    // Asserts that the route or component produced the expected result.
    expect(fetch).toHaveBeenCalledWith('/api/example', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Test': '1' },
      method: 'POST',
      body: '{}'
    });
  });

  // Verifies that falls back for invalid JSON and throws request errors.
  it('falls back for invalid JSON and throws request errors', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse({ ok: false, status: 500, body: 'plain failure' }));

    await expect(api('/api/fail')).rejects.toMatchObject({
      message: 'plain failure',
      payload: { ok: false, error: 'plain failure' },
      status: 500
    });
  });

  // Verifies that throws API-level failures even when HTTP succeeded.
  it('throws API-level failures even when HTTP succeeded', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse({ body: JSON.stringify({ ok: false, error: 'Nope' }) }));

    await expect(api('/api/nope')).rejects.toMatchObject({
      message: 'Nope',
      status: 200
    });
  });
});
