const accountRepository = require('../repositories/accountRepository');
const transactionRepository = require('../repositories/transactionRepository');
const customerRepository = require('../repositories/customerRepository');
const { AppError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');
const auditRepository = require('../repositories/auditRepository');
const accountService = {
  async getAllAccounts(query) { return accountRepository.findAll(query); },
  async getAccountById(id) { const account = await accountRepository.findById(id); if (!account) throw new AppError('Account not found', 404); return account; },
  async getAccountsByCustomer(id) { return accountRepository.findByCustomerId(id); },
  async openAccount(data) {
    if (!await customerRepository.findById(data.customerId)) throw new AppError('Customer not found', 404);
    return accountRepository.create(data);
  },
  async deposit(id, amount, description = 'Deposit', actor) {
    validateAmount(amount);
    const result = await mutateWithLedger(id, amount, 'Credit', description);
    const { account, transaction } = result;
    if (!account) throw await depositUnavailableError(id);
    if (actor) await auditRepository.create({ ...actor, action: 'deposit', resourceType: 'account', resourceId: id, details: { amount, transactionId: transaction._id } });
    return { account, transaction };
  },
  async withdraw(id, amount, description = 'Withdrawal', actor) {
    validateAmount(amount);
    const { account, transaction } = await mutateWithLedger(id, amount, 'Debit', description);
    if (!account) {
      const existing = await accountRepository.findById(id);
      if (!existing || existing.status !== 'Active') throw new AppError('Account not found or inactive', existing ? 400 : 404);
      throw new AppError('Insufficient balance', 400);
    }
    if (actor) await auditRepository.create({ ...actor, action: 'withdraw', resourceType: 'account', resourceId: id, details: { amount, transactionId: transaction._id } });
    return { account, transaction };
  }
};
async function mutateWithLedger(id, amount, type, description) {
  const update = (session) => type === 'Credit'
    ? accountRepository.incrementActiveBalance(id, amount, session)
    : accountRepository.decrementActiveBalance(id, amount, session);
  const createTransaction = (account, session) => transactionRepository.create({ accountId: id, type, amount, description, balanceAfter: account.balance }, session);
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const account = await update(session);
      if (!account) { result = { account: null, transaction: null }; return; }
      result = { account, transaction: await createTransaction(account, session) };
    });
    return result;
  } catch (error) {
    if (!(error.code === 20 || error.codeName === 'IllegalOperation' || /Transaction numbers are only allowed|does not support transactions/i.test(error.message))) throw error;
    const account = await update(null);
    if (!account) return { account: null, transaction: null };
    try {
      const transaction = await createTransaction(account, null);
      return { account, transaction };
    } catch (ledgerError) {
      await accountRepository.rollbackActiveBalance(id, type === 'Credit' ? -amount : amount);
      throw ledgerError;
    }
  } finally { await session.endSession(); }
}
function validateAmount(amount) { if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) throw new AppError('Amount must be a finite number greater than 0', 400); }
async function depositUnavailableError(id) {
  const account = await accountRepository.findById(id);
  if (!account) return new AppError('Account not found', 404);
  if (account.status !== 'Active') return new AppError('Account is not active', 400);
  return new AppError('Deposit would exceed maximum account balance of 100,000,000', 400);
}
module.exports = accountService;
