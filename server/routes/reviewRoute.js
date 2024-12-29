const express = require('express');
const reviewController = require('../controller/reviewController');
const router = express.Router();


router.post('/reviews',  reviewController.addReview);
router.get('/reviews/:productId', reviewController.getReviews);

module.exports = router;
