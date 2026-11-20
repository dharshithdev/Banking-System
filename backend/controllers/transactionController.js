const service = require('../services/transactionService');
const transactionController = {
  async getAll(req, res, next) { try { res.json(await service.getAllTransactions({ page: req.query.page || 1, limit: req.query.limit || 10 })); } catch (e) { next(e); } },
  async getByAccount(req, res, next) { try { res.json(await service.getTransactionsByAccount(req.params.accountId, { page: req.query.page || 1, limit: req.query.limit || 10 })); } catch (e) { next(e); } }
};
module.exports = transactionController;
