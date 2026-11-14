const customerRepository = require('../repositories/customerRepository');
const accountRepository = require('../repositories/accountRepository');
const loanRepository = require('../repositories/loanRepository');

const customerService = {
  async getAllCustomers(query) {
    return customerRepository.findAll(query);
  },

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    const [accounts, loans] = await Promise.all([
      accountRepository.findByCustomerId(id),
      loanRepository.findByCustomerId(id)
    ]);
    return { ...customer, accounts, loans };
  },

  async createCustomer(data) {
    if (!data.name || !data.email || !data.phone) {
      throw new Error('Name, email and phone are required');
    }
    return customerRepository.create(data);
  },

  async updateCustomer(id, data) {
    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }
    return customerRepository.update(id, data);
  }

  // deleteCustomer intentionally missing
};

module.exports = customerService;
