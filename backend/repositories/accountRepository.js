const Account = require('../models/Account');
const { nextSequence } = require('../models/Counter');
const { isValidId, serialize, paginate } = require('../utils/db');

const accountRepository = {
  async findAll({ page = 1, limit = 5 } = {}) {
    return paginate(Account, {}, { openedAt: 1, _id: 1 }, { page, limit }, 5);
  },

  async findById(id) {
    if (!isValidId(id)) return null;
    return serialize(await Account.findById(id).lean());
  },

  async findByCustomerId(customerId) {
    if (!isValidId(customerId)) return [];
    return serialize(await Account.find({ customerId }).sort({ openedAt: 1 }).lean());
  },

  async create(accountData) {
    const seq = await nextSequence('account');
    const account = await Account.create({
      customerId: accountData.customerId,
      type: accountData.type,
      balance: accountData.balance || 0,
      accountNumber: `ACC${String(seq).padStart(6, '0')}`
    });
    return serialize(account.toObject());
  },

  async updateBalance(id, newBalance) {
    if (!isValidId(id)) return null;
    const account = await Account.findByIdAndUpdate(
      id,
      { balance: newBalance },
      { new: true, runValidators: true }
    ).lean();
    return serialize(account);
  }
};

module.exports = accountRepository;
