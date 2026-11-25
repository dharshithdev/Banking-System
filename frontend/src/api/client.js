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
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, { method, headers, credentials: 'include', body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }
  const text = await response.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }
  if (!response.ok) {
    if (response.status === 401 && !['/auth/login', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password', '/auth/reset-password'].includes(path)) {
      window.dispatchEvent(new CustomEvent('bank-manager-unauthorized'));
    }
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }
  return data;
}
export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  verifyLoginOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
  resendLoginOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: { email } }),
  requestPasswordReset: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  confirmPasswordReset: ({ email, otp, newPassword }) => request('/auth/reset-password', { method: 'POST', body: { email, otp, newPassword } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' })
};
