const Account = require('../models/Account');
const { nextSequence } = require('../models/Counter');
const { isValidId, serialize, paginate } = require('../utils/db');
const MAX_ACCOUNT_BALANCE = 100000000;
const accountRepository = {
  async findAll(query) { return paginate(Account, {}, { openedAt: 1, _id: 1 }, query || {}, 5); },
  async findById(id) { if (!isValidId(id)) return null; return serialize(await Account.findById(id).lean()); },
  async findByCustomerId(id) { if (!isValidId(id)) return []; return serialize(await Account.find({ customerId: id }).sort({ openedAt: 1 }).lean()); },
  async create(data) {
    const seq = await nextSequence('account');
    const doc = await Account.create({ customerId: data.customerId, type: data.type, balance: data.balance ?? 0, accountNumber: `ACC${String(seq).padStart(6, '0')}` });
    return serialize(doc.toObject());
  },
  async incrementActiveBalance(id, amount, session = null) {
    if (!isValidId(id)) return null;
    const query = { _id: id, status: 'Active', balance: { $lte: MAX_ACCOUNT_BALANCE - amount } };
    return serialize(await Account.findOneAndUpdate(query, { $inc: { balance: amount } }, { new: true, runValidators: true, session }).lean());
  },
  async decrementActiveBalance(id, amount, session = null) {
    if (!isValidId(id)) return null;
    return serialize(await Account.findOneAndUpdate({ _id: id, status: 'Active', balance: { $gte: amount } }, { $inc: { balance: -amount } }, { new: true, runValidators: true, session }).lean());
  },
  async rollbackActiveBalance(id, amount) {
    return Account.updateOne({ _id: id, status: 'Active' }, { $inc: { balance: amount } });
  },
  MAX_ACCOUNT_BALANCE
};
module.exports = accountRepository;
