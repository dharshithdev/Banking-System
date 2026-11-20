const loanRepository = require('../repositories/loanRepository');
const customerRepository = require('../repositories/customerRepository');
const accountRepository = require('../repositories/accountRepository');
const { AppError } = require('../middleware/errorHandler');
const loanService = {
  async getAllLoans(query) { return loanRepository.findAll(query); },
  async getLoanById(id) { const loan = await loanRepository.findById(id); if (!loan) throw new AppError('Loan not found', 404); return loan; },
  async getLoansByCustomer(id) { return loanRepository.findByCustomerId(id); },
  async applyForLoan(data) {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) throw new AppError('Customer not found', 404);
    if (data.accountId) {
      const account = await accountRepository.findById(data.accountId);
      if (!account || account.customerId !== customer.id) throw new AppError('The selected account does not belong to this customer', 400);
    }
    return loanRepository.create(data);
  },
  async approveLoan(id) {
    const loan = await loanRepository.findById(id);
    if (!loan) throw new AppError('Loan not found', 404);
    const P = loan.principal, annualRate = loan.annualInterestRate ?? loan.interestRate, n = loan.tenureMonths;
    if (!Number.isFinite(P) || P <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isInteger(n) || n < 1) throw new AppError('Loan principal, interest rate, or tenure is invalid', 422);
    const r = annualRate / 12 / 100;
    const factor = Math.pow(1 + r, n);
    const emi = Math.round((r === 0 ? P / n : P * r * factor / (factor - 1)) * 100) / 100;
    const approved = await loanRepository.approvePending(id, emi);
    if (approved) return approved;
    if (!await loanRepository.findById(id)) throw new AppError('Loan not found', 404);
    throw new AppError('Only pending loans can be approved', 409);
  }
};
module.exports = loanService;
