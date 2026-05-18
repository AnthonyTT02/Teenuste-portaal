// Core API fetch wrapper that automatically manages credentials and content headers
export async function api(path, options = {}) {
  // Send request using credentials: 'include' to handle sessions correctly
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  // Extract raw text first to avoid crash on empty or non-JSON payloads
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Graceful fallback if server returns standard error strings or HTML instead of JSON
    payload = { ok: false, error: text || 'Invalid JSON response' };
  }

  // Handle request failures or explicitly returned false statuses
  if (!response.ok || (payload && payload.ok === false)) {
    const error = new Error(payload?.error || `Request failed: ${response.status}`);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }

  // Return standard parsed JSON object
  return payload;
}