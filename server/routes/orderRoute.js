const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { accessControl } = require('../utils/access_control');


router.post('/createOrder',orderController.createOrder);
router.get('/viewOrders', orderController.viewUserOrders);
router.get('/viewAllOrders', (req, res, next) => accessControl('1', req, res, next), orderController.viewAllOrders);
router.get('/viewSellerOrders', (req, res, next) => accessControl('3', req, res, next), orderController.viewSellerOrders);
router.patch('/orderStatus/:orderId', (req, res, next) => accessControl('1,3', req, res, next), orderController.updateOrderStatus);


module.exports = router;