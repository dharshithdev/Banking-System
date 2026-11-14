const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.get('/', loanController.getAll);
router.get('/:id', loanController.getById);
router.get('/customer/:customerId', loanController.getByCustomer);
router.post('/', loanController.apply);
router.post('/:id/approve', loanController.approve);

module.exports = router;
