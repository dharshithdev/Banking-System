const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAll);
router.get('/account/:accountId', transactionController.getByAccount);

module.exports = router;
