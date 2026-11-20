const accountRepository = require('../repositories/accountRepository');
const transactionRepository = require('../repositories/transactionRepository');
const customerRepository = require('../repositories/customerRepository');
const { AppError } = require('../middleware/errorHandler');
const accountService = {
  async getAllAccounts(query) { return accountRepository.findAll(query); },
  async getAccountById(id) { const account = await accountRepository.findById(id); if (!account) throw new AppError('Account not found', 404); return account; },
  async getAccountsByCustomer(id) { return accountRepository.findByCustomerId(id); },
  async openAccount(data) {
    if (!await customerRepository.findById(data.customerId)) throw new AppError('Customer not found', 404);
    return accountRepository.create(data);
  },
  async deposit(id, amount, description = 'Deposit') {
    validateAmount(amount);
    const account = await accountRepository.incrementActiveBalance(id, amount);
    if (!account) throw await unavailableError(id);
    const transaction = await transactionRepository.create({ accountId: id, type: 'Credit', amount, description, balanceAfter: account.balance });
    return { account, transaction };
  },
  async withdraw(id, amount, description = 'Withdrawal') {
    validateAmount(amount);
    const account = await accountRepository.decrementActiveBalance(id, amount);
    if (!account) {
      const existing = await accountRepository.findById(id);
      if (!existing || existing.status !== 'Active') throw new AppError('Account not found or inactive', existing ? 400 : 404);
      throw new AppError('Insufficient balance', 400);
    }
    const transaction = await transactionRepository.create({ accountId: id, type: 'Debit', amount, description, balanceAfter: account.balance });
    return { account, transaction };
  }
};
function validateAmount(amount) { if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) throw new AppError('Amount must be a finite number greater than 0', 400); }
async function unavailableError(id) { const account = await accountRepository.findById(id); return new AppError(!account ? 'Account not found' : 'Account is not active', account ? 400 : 404); }
module.exports = accountService;
