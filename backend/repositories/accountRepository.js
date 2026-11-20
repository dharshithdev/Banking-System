const Account = require('../models/Account');
const { nextSequence } = require('../models/Counter');
const { isValidId, serialize, paginate } = require('../utils/db');
const accountRepository = {
  async findAll(query) { return paginate(Account, {}, { openedAt: 1, _id: 1 }, query || {}, 5); },
  async findById(id) { if (!isValidId(id)) return null; return serialize(await Account.findById(id).lean()); },
  async findByCustomerId(id) { if (!isValidId(id)) return []; return serialize(await Account.find({ customerId: id }).sort({ openedAt: 1 }).lean()); },
  async create(data) {
    const seq = await nextSequence('account');
    const doc = await Account.create({ customerId: data.customerId, type: data.type, balance: data.balance ?? 0, accountNumber: `ACC${String(seq).padStart(6, '0')}` });
    return serialize(doc.toObject());
  },
  async incrementActiveBalance(id, amount) {
    if (!isValidId(id)) return null;
    return serialize(await Account.findOneAndUpdate({ _id: id, status: 'Active' }, { $inc: { balance: amount } }, { new: true, runValidators: true }).lean());
  },
  async decrementActiveBalance(id, amount) {
    if (!isValidId(id)) return null;
    return serialize(await Account.findOneAndUpdate({ _id: id, status: 'Active', balance: { $gte: amount } }, { $inc: { balance: -amount } }, { new: true, runValidators: true }).lean());
  }
};
module.exports = accountRepository;
