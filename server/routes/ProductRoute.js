const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const { accessControl } = require('../utils/access_control'); 

function setAccessControl(accessTypes) {
  return (req, res, next) => {
    accessControl(accessTypes, req, res, next);
  };
}

// Routes
router.post('/product', setAccessControl('3'), productController.addProduct);

router.get('/products', setAccessControl('*'), productController.viewProducts);

router.get('/product/:id', setAccessControl('*'), productController.viewSingleProduct);

router.get('/products/user/:id', productController.viewProductsByUser);

router.get('/products/seller/:userId', productController.getProductsByUser);

router.get('/products/category/:category', productController.viewProductsByCategory);

router.post('/blockP', setAccessControl('1'), productController.blockProduct);

router.post('/unblockP', setAccessControl('1'), productController.unblockProduct);

// router.put('/products/:Id', setAccessControl('3'), productController.updateProduct);


module.exports = router;
