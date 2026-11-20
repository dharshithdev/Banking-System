const Customer = require('../models/Customer');
const { isValidId, serialize, paginate } = require('../utils/db');
const customerRepository = {
  async findAll(query) { return paginate(Customer, {}, { createdAt: 1, _id: 1 }, query || {}, 5); },
  async findById(id) { if (!isValidId(id)) return null; return serialize(await Customer.findById(id).lean()); },
  async create(data) { const doc = await Customer.create({ name: data.name, email: data.email, phone: data.phone, address: data.address }); return serialize(doc.toObject()); },
  async update(id, updates) {
    if (!isValidId(id)) return null;
    const { name, email, phone, address } = updates;
    const fields = Object.fromEntries(Object.entries({ name, email, phone, address }).filter(([, v]) => v !== undefined));
    return serialize(await Customer.findByIdAndUpdate(id, fields, { new: true, runValidators: true }).lean());
  },
  async deleteById(id) { if (!isValidId(id)) return null; return serialize(await Customer.findByIdAndDelete(id).lean()); }
};
module.exports = customerRepository;
