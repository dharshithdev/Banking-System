const customerRepository = require('../repositories/customerRepository');
const accountRepository = require('../repositories/accountRepository');
const loanRepository = require('../repositories/loanRepository');
const { AppError } = require('../middleware/errorHandler');
const customerService = {
  async getAllCustomers(query) { return customerRepository.findAll(query); },
  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    const [accounts, loans] = await Promise.all([accountRepository.findByCustomerId(id), loanRepository.findByCustomerId(id)]);
    return { ...customer, accounts, loans };
  },
  async createCustomer(data) { return customerRepository.create(data); },
  async updateCustomer(id, data) {
    if (!await customerRepository.findById(id)) throw new AppError('Customer not found', 404);
    return customerRepository.update(id, data);
  },
  async deleteCustomer(id) {
    if (!await customerRepository.findById(id)) throw new AppError('Customer not found', 404);
    const [accounts, loans] = await Promise.all([accountRepository.findByCustomerId(id), loanRepository.findByCustomerId(id)]);
    if (accounts.length || loans.length) throw new AppError(`Customer cannot be deleted because ${accounts.length} account(s) and ${loans.length} loan(s) are linked to this customer.`, 409);
    await customerRepository.deleteById(id);
    return { message: 'Customer deleted successfully' };
  }
};
module.exports = customerService;
