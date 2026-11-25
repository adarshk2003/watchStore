const Review = require('../db/models/review');
const Product = require('../db/models/product');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');

    // Extract token from header
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
        return res.status(401).json({ message: "No token provided. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id }; // Add user ID to the request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Add a review
exports.addReview = [authenticate, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'A valid Product ID is required.' });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const sanitizedComment = typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';

    const newReview = new Review({
      productId,
      userId,
      rating: numericRating,
      comment: sanitizedComment
    });

    await newReview.save();

    // Recompute product ratings aggregate
    try {
      const stats = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: '$productId',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
          ratingsCount: stats[0].count
        });
      }
    } catch (aggErr) {
      console.error('Error updating product rating aggregate:', aggErr);
    }

    res.status(201).send({ message: 'Review added successfully', data: newReview });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', error: error.message });
  }
}];

// Fetch reviews for a product
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const count = reviews.length;
    const avgRating = count > 0 
      ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count) * 10) / 10 
      : 0;

    res.status(200).send({
      data: reviews,
      summary: { count, avgRating }
    });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', error: error.message });
  }
};
