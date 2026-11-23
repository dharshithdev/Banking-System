const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { login: validateLogin } = require('../middleware/validate');
router.post('/login', validateLogin, controller.login);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
module.exports = router;
