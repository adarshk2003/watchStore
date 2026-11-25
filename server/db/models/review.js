const mongoose = require('mongoose');

const review = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

review.index({ productId: 1 });

module.exports = mongoose.model('Review', review);
