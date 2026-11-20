const crypto = require('crypto');
const { AppError } = require('./errorHandler');
const DEFAULT_EMAIL = 'manager@example.com';
const DEFAULT_PASSWORD = 'ChangeMe-Local-Only-2026!';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) throw new AppError('Authentication is not configured', 500);
  return secret || 'local-development-secret-change-before-production';
}
function signToken(claims) {
  const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...claims, iat: now, exp: now + 8 * 60 * 60 })).toString('base64url');
  const input = `${head}.${body}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(input).digest('base64url');
  return `${input}.${sig}`;
}
function authenticate(req, res, next) {
  const match = /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/.exec(req.get('authorization') || '');
  if (!match) return next(new AppError('Authentication required', 401));
  try {
    const [head, body, signature] = match[1].split('.');
    const header = JSON.parse(Buffer.from(head, 'base64url').toString());
    if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new Error('Invalid token header');
    const expected = crypto.createHmac('sha256', getSecret()).update(`${head}.${body}`).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Invalid token signature');
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) throw new Error('Token expired');
    req.user = claims;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
function authorizeRole(role) {
  return (req, res, next) => req.user?.role === role ? next() : next(new AppError('Insufficient permissions', 403));
}
function login(req, res, next) {
  const email = Buffer.from(String(req.body?.email || ''));
  const password = Buffer.from(String(req.body?.password || ''));
  const safeEqual = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!safeEqual(email, Buffer.from((process.env.MANAGER_EMAIL || DEFAULT_EMAIL).trim().toLowerCase())) ||
      !safeEqual(password, Buffer.from(process.env.MANAGER_PASSWORD || DEFAULT_PASSWORD))) {
    return next(new AppError('Invalid email or password', 401));
  }
  try { res.json({ token: signToken({ role: 'manager' }) }); } catch (err) { next(err); }
}
module.exports = { authenticate, authorizeRole, login };
