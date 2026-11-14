const transactionService = require('../services/transactionService');

const transactionController = {
  async getAll(req, res) {
    try {
      const result = await transactionService.getAllTransactions({
        page: req.query.page || 1,
        limit: req.query.limit || 10
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByAccount(req, res) {
    try {
      const result = await transactionService.getTransactionsByAccount(req.params.accountId, {
        page: req.query.page || 1,
        limit: req.query.limit || 10
      });
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
};

module.exports = transactionController;
