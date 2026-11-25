const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/login', authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
