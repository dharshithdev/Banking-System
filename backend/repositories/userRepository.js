const User = require('../models/User');

const userRepository = {
  async findByEmail(email) { return User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash').lean(); },
  async findById(id) { return User.findById(id).lean(); },
  async incrementTokenVersion(id) { return User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } }, { new: true }).lean(); },
  async create(data) { return User.create(data); },
  async upsertManager(data) {
    return User.findOneAndUpdate({ email: data.email }, { $set: { name: data.name, passwordHash: data.passwordHash, role: 'manager' }, $setOnInsert: { tokenVersion: 0 } }, { upsert: true, new: true, runValidators: true });
  }
};

module.exports = userRepository;
