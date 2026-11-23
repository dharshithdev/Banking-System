const crypto = require('crypto');
const { promisify } = require('util');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('./errorHandler');
const scrypt = promisify(crypto.scrypt);
const COOKIE_NAME = 'bank_manager_token';

function encode(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function signToken(claims) {
  const head = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...claims, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 });
  const input = `${head}.${body}`;
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(input).digest('base64url');
  return `${input}.${signature}`;
}
function verifyToken(token) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [head, body, signature] = parts;
  const header = JSON.parse(Buffer.from(head, 'base64url').toString());
  if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new Error('Invalid token header');
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${head}.${body}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Invalid token signature');
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (!Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) throw new Error('Token expired');
  return claims;
}
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}
async function verifyPassword(password, encoded) {
  const [scheme, saltText, hashText] = String(encoded || '').split('$');
  if (scheme !== 'scrypt' || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, 'base64url');
  const actual = await scrypt(password, Buffer.from(saltText, 'base64url'), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600${secure}`);
}
function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}
async function authenticate(req, res, next) {
  const bearer = /^Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)$/i.exec(req.get('authorization') || '');
  const token = req.cookies?.[COOKIE_NAME] || bearer?.[1];
  if (!token) return next(new AppError('Authentication required', 401));
  try {
    const claims = verifyToken(token);
    const user = await userRepository.findById(claims.sub);
    if (!user || user.tokenVersion !== claims.tokenVersion || user.role !== claims.role) throw new Error('Session revoked');
    req.user = { id: String(user._id), email: user.email, role: user.role, tokenVersion: user.tokenVersion };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
function authorizeRole(role) {
  return (req, res, next) => req.user?.role === role ? next() : next(new AppError('Insufficient permissions', 403));
}
module.exports = { authenticate, authorizeRole, signToken, hashPassword, verifyPassword, setAuthCookie, clearAuthCookie, COOKIE_NAME };
