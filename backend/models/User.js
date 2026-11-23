const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['manager'], required: true, default: 'manager' },
  tokenVersion: { type: Number, default: 0 },
  otpHash: { type: String, default: null, select: false },
  otpExpiresAt: { type: Date, default: null, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
