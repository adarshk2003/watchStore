const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

// Seller form submission route
router.post('/seller-form/:userId', sellerController.createSellerProfile);

// Route to get user data
router.get('/seller-form/:userId', sellerController.getUserData);

module.exports = router;
