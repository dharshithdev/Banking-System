const Loan = require('../models/Loan');
const { nextSequence } = require('../models/Counter');
const { isValidId, serialize, paginate } = require('../utils/db');
const loanRepository = {
  async findAll(query) { return paginate(Loan, {}, { appliedAt: 1, _id: 1 }, query || {}, 5); },
  async findById(id) { if (!isValidId(id)) return null; return serialize(await Loan.findById(id).lean()); },
  async findByCustomerId(id) { if (!isValidId(id)) return []; return serialize(await Loan.find({ customerId: id }).sort({ appliedAt: 1 }).lean()); },
  async create(data) {
    const seq = await nextSequence('loan');
    const doc = await Loan.create({ customerId: data.customerId, accountId: data.accountId || null, type: data.type, principal: data.principal, interestRate: data.interestRate, tenureMonths: data.tenureMonths, loanNumber: `LN${String(seq).padStart(6, '0')}`, status: 'Pending', emi: null, outstanding: data.principal, approvedAt: null });
    return serialize(doc.toObject());
  },
  async approvePending(id, emi) {
    if (!isValidId(id)) return null;
    return serialize(await Loan.findOneAndUpdate({ _id: id, status: 'Pending' }, { $set: { status: 'Approved', emi, approvedAt: new Date() } }, { new: true, runValidators: true }).lean());
  }
};
module.exports = loanRepository;
