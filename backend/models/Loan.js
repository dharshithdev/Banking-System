const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  loanNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Personal', 'Home', 'Car', 'Education'], default: 'Personal' },
  principal: { type: Number, required: true, min: 1000, max: 50000000, validate: { validator: (value) => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, message: 'Principal supports at most 2 decimal places' } },
  interestRate: { type: Number, required: true, min: 0, max: 50 },
  tenureMonths: { type: Number, required: true, min: 1, max: 360, validate: { validator: Number.isInteger, message: 'Tenure must be a whole number of months' } },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  emi: { type: Number, default: null },
  outstanding: { type: Number, default: 0 },
  appliedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Loan', loanSchema);
