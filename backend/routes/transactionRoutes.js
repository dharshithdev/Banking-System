const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const v = require('../middleware/validate');

router.get('/', v.pagination, transactionController.getAll);
router.get('/account/:accountId', v.objectId('accountId'), v.pagination, transactionController.getByAccount);

module.exports = router;
