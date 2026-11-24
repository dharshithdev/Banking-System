const { AppError } = require('./errorHandler');
const ID = /^[a-f\d]{24}$/i;
function safeTree(value) {
  if (Array.isArray(value)) return value.forEach(safeTree);
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) throw new AppError('Invalid request field', 400);
    safeTree(value[key]);
  }
}
function sanitize(req, res, next) {
  try { safeTree(req.body); safeTree(req.query); next(); } catch (err) { next(err); }
}
function objectId(name) {
  return (req, res, next) => ID.test(String(req.params[name] || '')) ? next() : next(new AppError(`Invalid ${name}`, 400));
}
function pagination(req, res, next) {
  for (const key of ['page', 'limit']) if (req.query[key] !== undefined &&
    (!/^\d+$/.test(String(req.query[key])) || Number(req.query[key]) < 1 || Number(req.query[key]) > (key === 'page' ? 10000 : 100))) {
    return next(new AppError(`Invalid ${key}`, 400));
  }
  if (req.query.page && req.query.limit && Number(req.query.page) * Number(req.query.limit) > 10000) return next(new AppError('Pagination offset is too large', 400));
  if (req.query.accountId && !ID.test(String(req.query.accountId))) return next(new AppError('Invalid accountId', 400));
  next();
}
function customer(req, res, next) {
  const d = req.body || {};
  for (const key of ['name', 'email', 'phone', 'address']) if (typeof d[key] !== 'string' || !d[key].trim()) return next(new AppError(`${key} is required`, 400));
  d.name = d.name.trim();
  d.email = d.email.trim().toLowerCase();
  d.phone = d.phone.replace(/[\s-]/g, '');
  d.address = d.address.trim();
  if (d.name.length < 2 || d.name.length > 80 || !/^[\p{L} .-]+$/u.test(d.name)) return next(new AppError('Name must be 2–80 letters, spaces, periods, or hyphens.', 400));
  if (d.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return next(new AppError('A valid email of at most 120 characters is required', 400));
  if (!/^\+?[0-9]{10,15}$/.test(d.phone) || /^(\d)\1+$/.test(d.phone.replace(/^\+/, ''))) return next(new AppError('A valid 10–15 digit phone number is required', 400));
  if (d.address.length < 5 || d.address.length > 200) return next(new AppError('Address must be 5–200 characters', 400));
  next();
}
function account(req, res, next) {
  const d = req.body || {};
  if (!ID.test(String(d.customerId || ''))) return next(new AppError('A valid customerId is required', 400));
  if (!['Savings', 'Current', 'Fixed Deposit'].includes(d.type)) return next(new AppError('Invalid account type', 400));
  if (typeof d.balance !== 'number' || !Number.isFinite(d.balance) || d.balance < 0 || d.balance > 100_000_000 || !hasTwoDecimals(d.balance)) return next(new AppError('Initial deposit must be between 0 and 100,000,000 with at most 2 decimal places', 400));
  next();
}
function amount(req, res, next) {
  if (typeof req.body?.amount !== 'number' || !Number.isFinite(req.body.amount) || req.body.amount <= 0 || req.body.amount > 10_000_000 || !hasTwoDecimals(req.body.amount)) return next(new AppError('Amount must be greater than 0 and at most 10,000,000 with up to 2 decimal places', 400));
  if (req.body.description !== undefined && (typeof req.body.description !== 'string' || req.body.description.trim().length > 140)) return next(new AppError('Description must be a string of at most 140 characters', 400));
  if (typeof req.body.description === 'string') req.body.description = req.body.description.trim();
  next();
}
function loan(req, res, next) {
  const d = req.body || {};
  if (!ID.test(String(d.customerId || ''))) return next(new AppError('A valid customerId is required', 400));
  if (d.accountId && !ID.test(String(d.accountId))) return next(new AppError('Invalid accountId', 400));
  if (!['Personal', 'Home', 'Car', 'Education'].includes(d.type)) return next(new AppError('Invalid loan type', 400));
  if (typeof d.principal !== 'number' || !Number.isFinite(d.principal) || d.principal < 1000 || d.principal > 50_000_000 || !hasTwoDecimals(d.principal)) return next(new AppError('Principal must be 1,000–50,000,000 with at most 2 decimal places', 400));
  if (typeof d.interestRate !== 'number' || !Number.isFinite(d.interestRate) || d.interestRate < 0 || d.interestRate > 50) return next(new AppError('Interest rate must be between 0 and 50 percent', 400));
  if (!Number.isInteger(d.tenureMonths) || d.tenureMonths < 1 || d.tenureMonths > 360) return next(new AppError('Tenure must be an integer between 1 and 360 months', 400));
  next();
}
function login(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || email.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return next(new AppError('Enter a valid email address', 400));
  if (typeof password !== 'string' || password.length < 6) return next(new AppError('Password must be at least 6 characters', 400));
  req.body.email = email.trim().toLowerCase();
  next();
}
function verifyOtp(req, res, next) {
  const { email, otp } = req.body || {};
  if (typeof email !== 'string' || email.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return next(new AppError('Enter a valid email address', 400));
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) return next(new AppError('Verification code must contain exactly 6 digits', 400));
  req.body.email = email.trim().toLowerCase();
  next();
}
function resendOtp(req, res, next) {
  const { email } = req.body || {};
  if (typeof email !== 'string' || email.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return next(new AppError('Enter a valid email address', 400));
  req.body.email = email.trim().toLowerCase();
  next();
}
function normalizedEmail(value) {
  return typeof value === 'string' && value.trim().length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
function validateForgotPassword(req, res, next) {
  const { email } = req.body || {};
  if (!normalizedEmail(email)) return next(new AppError('Enter a valid email address', 400));
  req.body.email = email.trim().toLowerCase();
  next();
}
function validateResetPassword(req, res, next) {
  const { email, otp, newPassword } = req.body || {};
  if (!normalizedEmail(email)) return next(new AppError('Enter a valid email address', 400));
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) return next(new AppError('Reset code must contain exactly 6 digits', 400));
  if (typeof newPassword !== 'string' || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[\d\W]/.test(newPassword)) {
    return next(new AppError('Password must be at least 8 characters and include uppercase, lowercase, and a number or special character', 400));
  }
  req.body.email = email.trim().toLowerCase();
  next();
}
function hasTwoDecimals(value) { return Math.abs(value * 100 - Math.round(value * 100)) < 1e-7; }
module.exports = { sanitize, objectId, pagination, customer, account, amount, loan, login, verifyOtp, resendOtp, validateForgotPassword, validateResetPassword };
