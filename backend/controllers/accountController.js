const service = require('../services/accountService');
const accountController = {
  async getAll(req, res, next) { try { res.json(await service.getAllAccounts({ page: req.query.page || 1, limit: req.query.limit || 5 })); } catch (e) { next(e); } },
  async getById(req, res, next) { try { res.json(await service.getAccountById(req.params.id)); } catch (e) { next(e); } },
  async getByCustomer(req, res, next) { try { res.json(await service.getAccountsByCustomer(req.params.customerId)); } catch (e) { next(e); } },
  async open(req, res, next) { try { res.status(201).json(await service.openAccount(req.body)); } catch (e) { next(e); } },
  async deposit(req, res, next) { try { res.json(await service.deposit(req.params.id, req.body.amount, req.body.description, { actorId: req.user.id, actorEmail: req.user.email })); } catch (e) { next(e); } },
  async withdraw(req, res, next) { try { res.json(await service.withdraw(req.params.id, req.body.amount, req.body.description, { actorId: req.user.id, actorEmail: req.user.email })); } catch (e) { next(e); } }
};
module.exports = accountController;
