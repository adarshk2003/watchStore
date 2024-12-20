const express = require('express');
const reviewController = require('../controller/reviewController');
const router = express.Router();

router.post('/reviews', reviewController.addReview);

module.exports = router;
