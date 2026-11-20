const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  amount: { type: Number, required: true, min: 0.01, max: 10000000, validate: { validator: (value) => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, message: 'Amount supports at most 2 decimal places' } },
  description: { type: String, trim: true, maxlength: 140, default: '' },
  balanceAfter: { type: Number, required: true, max: 100000000, validate: { validator: (value) => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, message: 'Balance supports at most 2 decimal places' } },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
