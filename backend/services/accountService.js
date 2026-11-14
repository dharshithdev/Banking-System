const accountRepository = require('../repositories/accountRepository');
const transactionRepository = require('../repositories/transactionRepository');
const customerRepository = require('../repositories/customerRepository');

const accountService = {
  async getAllAccounts(query) {
    return accountRepository.findAll(query);
  },

  async getAccountById(id) {
    const account = await accountRepository.findById(id);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  },

  async getAccountsByCustomer(customerId) {
    return accountRepository.findByCustomerId(customerId);
  },

  async openAccount(data) {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!data.type || !['Savings', 'Current', 'Fixed Deposit'].includes(data.type)) {
      throw new Error('Invalid account type');
    }
    return accountRepository.create(data);
  },

  async deposit(accountId, amount, description = 'Deposit') {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    const account = await accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    if (account.status !== 'Active') {
      throw new Error('Account is not active');
    }

    // CRITICAL BUG: balance is calculated correctly but NEVER saved.
    // Transaction is created with the correct intended balanceAfter,
    // so UI looks successful, but actual account balance stays the same.
    const newBalance = account.balance + amount;

    // BUG: missing call to accountRepository.updateBalance(accountId, newBalance);

    const tx = await transactionRepository.create({
      accountId,
      type: 'Credit',
      amount,
      description,
      balanceAfter: newBalance
    });

    // Returns stale account (old balance)
    return { account, transaction: tx };
  },

  // withdraw intentionally not implemented (one of the 3 missing features)
  async withdraw(accountId, amount, description = 'Withdrawal') {
    throw new Error('Withdraw functionality not implemented');
  }
};

module.exports = accountService;
