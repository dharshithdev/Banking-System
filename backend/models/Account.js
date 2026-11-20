const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  accountNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Savings', 'Current', 'Fixed Deposit'], required: true },
  balance: { type: Number, default: 0, min: 0, max: 100000000, validate: { validator: (value) => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, message: 'Balance supports at most 2 decimal places' } },
  status: { type: String, enum: ['Active', 'Inactive', 'Closed'], default: 'Active' },
  openedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);
