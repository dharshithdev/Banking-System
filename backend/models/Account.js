const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  accountNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Savings', 'Current', 'Fixed Deposit'], required: true },
  balance: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'Closed'], default: 'Active' },
  openedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);
