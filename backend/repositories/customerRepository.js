const Customer = require('../models/Customer');
const { isValidId, serialize, paginate } = require('../utils/db');

const customerRepository = {
  async findAll({ page = 1, limit = 5 } = {}) {
    return paginate(Customer, {}, { createdAt: 1, _id: 1 }, { page, limit }, 5);
  },

  async findById(id) {
    if (!isValidId(id)) return null;
    return serialize(await Customer.findById(id).lean());
  },

  async create(customerData) {
    const { name, email, phone, address } = customerData;
    const customer = await Customer.create({ name, email, phone, address });
    return serialize(customer.toObject());
  },

  async update(id, updates) {
    if (!isValidId(id)) return null;
    const { name, email, phone, address } = updates;
    const fields = Object.fromEntries(
      Object.entries({ name, email, phone, address }).filter(([, v]) => v !== undefined)
    );
    const customer = await Customer.findByIdAndUpdate(id, fields, {
      new: true,
      runValidators: true
    }).lean();
    return serialize(customer);
  }

  // deleteById intentionally missing
};

module.exports = customerRepository;
