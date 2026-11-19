const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80, match: /^[\p{L} .-]+$/u },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, required: true, trim: true, minlength: 10, maxlength: 16, match: /^\+?[0-9]{10,15}$/, validate: { validator: (value) => !/^(\d)\1+$/.test(value.replace(/^\+/, '')), message: 'Phone number cannot contain repeated digits only' } },
  address: { type: String, trim: true, maxlength: 200, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
