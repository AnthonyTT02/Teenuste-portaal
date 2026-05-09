export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { ok: false, error: text || 'Invalid JSON response' };
  }

  if (!response.ok || (payload && payload.ok === false)) {
    const error = new Error(payload?.error || `Request failed: ${response.status}`);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }

  return payload;
}