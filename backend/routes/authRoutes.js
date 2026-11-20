const express = require('express');
const router = express.Router();
const { login } = require('../middleware/auth');
const { login: validateLogin } = require('../middleware/validate');
router.post('/login', validateLogin, login);
module.exports = router;
