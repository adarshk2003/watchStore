const express = require('express');
const sellerController = require('../controller/sellerController');
const router = express.Router();

router.post('/seller/:userId', sellerController.createSeller);
router.get('/seller/:userId', sellerController.getSellerData);

module.exports = router;
