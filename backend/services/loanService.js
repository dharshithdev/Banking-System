const loanRepository = require('../repositories/loanRepository');
const customerRepository = require('../repositories/customerRepository');

const loanService = {
  async getAllLoans(query) {
    return loanRepository.findAll(query);
  },

  async getLoanById(id) {
    const loan = await loanRepository.findById(id);
    if (!loan) {
      throw new Error('Loan not found');
    }
    return loan;
  },

  async getLoansByCustomer(customerId) {
    return loanRepository.findByCustomerId(customerId);
  },

  async applyForLoan(data) {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!data.principal || data.principal <= 0) {
      throw new Error('Principal must be positive');
    }
    if (!data.interestRate || data.interestRate <= 0) {
      throw new Error('Interest rate required');
    }
    if (!data.tenureMonths || data.tenureMonths <= 0) {
      throw new Error('Tenure required');
    }
    return loanRepository.create(data);
  },

  async approveLoan(loanId) {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    if (loan.status !== 'Pending') {
      throw new Error('Only pending loans can be approved');
    }

    // EMI calculation is intentionally missing (one of the 3 missing features)
    // Interns should implement:
    // r = interestRate / 12 / 100
    // EMI = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1)
    // and set the calculated EMI here.

    return loanRepository.update(loanId, {
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      emi: null   // stays null – must be calculated
    });
  }
};

module.exports = loanService;
