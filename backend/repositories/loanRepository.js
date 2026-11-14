const Loan = require('../models/Loan');
const { nextSequence } = require('../models/Counter');
const { isValidId, serialize, paginate } = require('../utils/db');

const loanRepository = {
  async findAll({ page = 1, limit = 5 } = {}) {
    return paginate(Loan, {}, { appliedAt: 1, _id: 1 }, { page, limit }, 5);
  },

  async findById(id) {
    if (!isValidId(id)) return null;
    return serialize(await Loan.findById(id).lean());
  },

  async findByCustomerId(customerId) {
    if (!isValidId(customerId)) return [];
    return serialize(await Loan.find({ customerId }).sort({ appliedAt: 1 }).lean());
  },

  async create(loanData) {
    const seq = await nextSequence('loan');
    const loan = await Loan.create({
      customerId: loanData.customerId,
      accountId: isValidId(loanData.accountId) ? loanData.accountId : null,
      type: loanData.type,
      principal: loanData.principal,
      interestRate: loanData.interestRate,
      tenureMonths: loanData.tenureMonths,
      loanNumber: `LN${String(seq).padStart(6, '0')}`,
      status: 'Pending',
      emi: null,
      outstanding: loanData.principal,
      approvedAt: null
    });
    return serialize(loan.toObject());
  },

  async update(id, updates) {
    if (!isValidId(id)) return null;
    const loan = await Loan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).lean();
    return serialize(loan);
  }
};

module.exports = loanRepository;
