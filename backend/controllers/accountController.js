const accountService = require('../services/accountService');

const accountController = {
  async getAll(req, res) {
    try {
      const result = await accountService.getAllAccounts({
        page: req.query.page || 1,
        limit: req.query.limit || 5
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const account = await accountService.getAccountById(req.params.id);
      res.json(account);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async getByCustomer(req, res) {
    try {
      const accounts = await accountService.getAccountsByCustomer(req.params.customerId);
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async open(req, res) {
    try {
      const account = await accountService.openAccount(req.body);
      res.status(201).json(account);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deposit(req, res) {
    try {
      const { amount, description } = req.body;
      const result = await accountService.deposit(req.params.id, amount, description);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async withdraw(req, res) {
    try {
      const { amount, description } = req.body;
      const result = await accountService.withdraw(req.params.id, amount, description);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

module.exports = accountController;
