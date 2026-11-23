const AuditLog = require('../models/AuditLog');

module.exports = {
  async create(entry) { return AuditLog.create(entry); }
};
