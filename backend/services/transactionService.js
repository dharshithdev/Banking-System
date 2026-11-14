const transactionRepository = require('../repositories/transactionRepository');
const accountRepository = require('../repositories/accountRepository');

const transactionService = {
  async getAllTransactions(query) {
    return transactionRepository.findAll(query);
  },

  async getTransactionsByAccount(accountId, query) {
    const account = await accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return transactionRepository.findByAccountId(accountId, query);
  }
};

module.exports = transactionService;
