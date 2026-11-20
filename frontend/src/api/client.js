const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; }
}
function buildQuery(params) {
  if (!params) return '';
  const values = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return values.length ? `?${new URLSearchParams(values)}` : '';
}
export async function request(path, { method = 'GET', body, params } = {}) {
  let response;
  try {
    const token = localStorage.getItem('bank-manager-token');
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token && path !== '/auth/login') headers.Authorization = `Bearer ${token}`;
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }
  const text = await response.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('bank-manager-token');
      window.dispatchEvent(new CustomEvent('bank-manager-unauthorized'));
    }
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }
  return data;
}
export const authApi = { login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }) };
