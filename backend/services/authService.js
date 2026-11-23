const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../middleware/errorHandler');
const { signToken, verifyPassword } = require('../middleware/auth');
const mailer = require('../utils/mailer');
const auditRepository = require('../repositories/auditRepository');

const OTP_TTL_MS = 5 * 60 * 1000;
const INVALID_OTP_MESSAGE = 'Invalid or expired verification code';

function createOtpHash(otp) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
  return `${salt}:${hash}`;
}

function verifyOtpHash(otp, encoded) {
  const [salt, expectedHex] = String(encoded || '').split(':');
  if (!salt || !/^[a-f\d]{64}$/i.test(expectedHex || '')) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = crypto.createHash('sha256').update(`${salt}:${otp}`).digest();
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function profile(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

function issueSession(user) {
  return {
    token: signToken({ sub: String(user._id), email: user.email, role: user.role, tokenVersion: user.tokenVersion }),
    profile: profile(user)
  };
}

async function sendChallenge(user) {
  const otp = String(crypto.randomInt(100000, 1000000));
  await userRepository.saveOtpChallenge(user._id, {
    otpHash: createOtpHash(otp),
    otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
  });
  try {
    await mailer.sendLoginOtpEmail({ to: user.email, name: user.name, otp });
  } catch (error) {
    await userRepository.clearOtpChallenge(user._id);
    throw new AppError('Unable to send the verification email. Please try again later.', 503);
  }
}

const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new AppError('Invalid email or password', 401);
    if (String(process.env.EMAIL_2FA_ENABLED ?? 'true').trim().toLowerCase() === 'false') return issueSession(user);
    await sendChallenge(user);
    return { requiresOtp: true, email: user.email, message: 'Verification code sent to your email' };
  },
  async verifyLoginOtp(email, otp) {
    const user = await userRepository.findByEmail(email);
    const now = new Date();
    if (!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt <= now || user.otpAttempts >= 5) {
      if (user && (user.otpExpiresAt <= now || user.otpAttempts >= 5)) await userRepository.clearOtpChallenge(user._id);
      throw new AppError(INVALID_OTP_MESSAGE, 401);
    }
    if (!verifyOtpHash(otp, user.otpHash)) {
      await userRepository.incrementOtpAttempts(user._id);
      throw new AppError(INVALID_OTP_MESSAGE, 401);
    }
    const consumed = await userRepository.consumeOtpChallenge(user._id, now);
    if (!consumed) throw new AppError(INVALID_OTP_MESSAGE, 401);
    await auditRepository.create({
      actorId: user._id,
      actorEmail: user.email,
      action: 'LOGIN_2FA_VERIFIED',
      resourceType: 'user',
      resourceId: String(user._id),
      details: { method: 'email_otp' }
    });
    return issueSession(user);
  },
  async resendLoginOtp(email) {
    if (String(process.env.EMAIL_2FA_ENABLED ?? 'true').trim().toLowerCase() === 'false') {
      return { message: 'If an active sign-in challenge exists, a new code has been sent.' };
    }
    const user = await userRepository.findByEmail(email);
    if (user?.otpHash && user.otpExpiresAt > new Date() && (user.otpAttempts ?? 0) < 5) await sendChallenge(user);
    return { message: 'If an active sign-in challenge exists, a new code has been sent.' };
  },
  async logout(userId) {
    const user = await userRepository.incrementTokenVersion(userId);
    if (!user) throw new AppError('User not found', 404);
  },
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return { id: String(user._id), name: user.name, email: user.email, role: user.role };
  }
};

module.exports = authService;
