const service = require('../services/loanService');
const loanController = {
  async getAll(req, res, next) { try { res.json(await service.getAllLoans({ page: req.query.page || 1, limit: req.query.limit || 5 })); } catch (e) { next(e); } },
  async getById(req, res, next) { try { res.json(await service.getLoanById(req.params.id)); } catch (e) { next(e); } },
  async getByCustomer(req, res, next) { try { res.json(await service.getLoansByCustomer(req.params.customerId)); } catch (e) { next(e); } },
  async apply(req, res, next) { try { res.status(201).json(await service.applyForLoan(req.body)); } catch (e) { next(e); } },
  async approve(req, res, next) { try { res.json(await service.approveLoan(req.params.id)); } catch (e) { next(e); } }
};
module.exports = loanController;
