const Transaction = require('../models/Transaction');
const { isValidId, serialize, paginate } = require('../utils/db');

const transactionRepository = {
  async findAll({ page = 1, limit = 10 } = {}) {
    return paginate(Transaction, {}, { timestamp: -1, _id: -1 }, { page, limit }, 10);
  },

  async findByAccountId(accountId, { page = 1, limit = 10 } = {}) {
    if (!isValidId(accountId)) {
      return { data: [], total: 0, page: 1, limit: Number(limit), totalPages: 1 };
    }
    return paginate(
      Transaction,
      { accountId },
      { timestamp: -1, _id: -1 },
      { page, limit },
      10
    );
  },

  async create(transactionData) {
    const tx = await Transaction.create({
      accountId: transactionData.accountId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      balanceAfter: transactionData.balanceAfter
    });
    return serialize(tx.toObject());
  }
};

module.exports = transactionRepository;
