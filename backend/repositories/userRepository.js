const User = require('../models/User');

const userRepository = {
  async findByEmail(email) { return User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash +otpHash +otpExpiresAt +otpAttempts').lean(); },
  async findById(id) { return User.findById(id).lean(); },
  async incrementTokenVersion(id) { return User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } }, { new: true }).lean(); },
  async saveOtpChallenge(id, { otpHash, otpExpiresAt }) {
    return User.findByIdAndUpdate(id, { $set: { otpHash, otpExpiresAt, otpAttempts: 0 } }, { new: true }).lean();
  },
  async incrementOtpAttempts(id) {
    return User.findOneAndUpdate(
      { _id: id, otpAttempts: { $lt: 5 } },
      [
        { $set: { otpAttempts: { $add: [{ $ifNull: ['$otpAttempts', 0] }, 1] } } },
        { $set: {
          otpHash: { $cond: [{ $gte: ['$otpAttempts', 5] }, null, '$otpHash'] },
          otpExpiresAt: { $cond: [{ $gte: ['$otpAttempts', 5] }, null, '$otpExpiresAt'] }
        } }
      ],
      { new: true }
    ).select('+otpHash +otpExpiresAt +otpAttempts').lean();
  },
  async clearOtpChallenge(id) {
    return User.findByIdAndUpdate(id, { $set: { otpHash: null, otpExpiresAt: null, otpAttempts: 0 } }, { new: true }).lean();
  },
  async consumeOtpChallenge(id, now = new Date()) {
    return User.findOneAndUpdate(
      { _id: id, otpHash: { $type: 'string' }, otpExpiresAt: { $gt: now }, otpAttempts: { $lt: 5 } },
      { $set: { otpHash: null, otpExpiresAt: null, otpAttempts: 0 } },
      { new: true }
    ).lean();
  },
  async create(data) { return User.create(data); },
  async upsertManager(data) {
    return User.findOneAndUpdate({ email: data.email }, { $set: { name: data.name, passwordHash: data.passwordHash, role: 'manager' }, $setOnInsert: { tokenVersion: 0 } }, { upsert: true, new: true, runValidators: true });
  }
};

module.exports = userRepository;
