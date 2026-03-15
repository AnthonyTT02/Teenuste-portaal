export async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await res.json()
    : { ok: false, error: await res.text() };

  if (!res.ok) {
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export function getUserId() {
  return localStorage.getItem('userId') || '';
}

export function getProviderId() {
  return localStorage.getItem('providerId') || localStorage.getItem('userProviderId') || '';
}
