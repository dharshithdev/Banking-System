const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.get('/customer/:customerId', accountController.getByCustomer);
router.post('/', accountController.open);
router.post('/:id/deposit', accountController.deposit);
router.post('/:id/withdraw', accountController.withdraw);

module.exports = router;
