const service = require('../services/customerService');
const customerController = {
  async getAll(req, res, next) { try { res.json(await service.getAllCustomers({ page: req.query.page || 1, limit: req.query.limit || 5 })); } catch (e) { next(e); } },
  async getById(req, res, next) { try { res.json(await service.getCustomerById(req.params.id)); } catch (e) { next(e); } },
  async create(req, res, next) { try { res.status(201).json(await service.createCustomer(req.body)); } catch (e) { next(e); } },
  async update(req, res, next) { try { res.json(await service.updateCustomer(req.params.id, req.body)); } catch (e) { next(e); } },
  async remove(req, res, next) { try { res.json(await service.deleteCustomer(req.params.id)); } catch (e) { next(e); } }
};
module.exports = customerController;
