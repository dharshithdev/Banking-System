const loanService = require('../services/loanService');

const loanController = {
  async getAll(req, res) {
    try {
      const result = await loanService.getAllLoans({
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
      const loan = await loanService.getLoanById(req.params.id);
      res.json(loan);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async getByCustomer(req, res) {
    try {
      const loans = await loanService.getLoansByCustomer(req.params.customerId);
      res.json(loans);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async apply(req, res) {
    try {
      const loan = await loanService.applyForLoan(req.body);
      res.status(201).json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async approve(req, res) {
    try {
      const loan = await loanService.approveLoan(req.params.id);
      res.json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

module.exports = loanController;
