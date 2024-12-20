const Review = require('../db/models/review');
const Product = require('../db/models/product');
const { success_function, error_function } = require('../utils/response-handler');

exports.addReview = async (req, res) => {
    try {
        const { productId, rating, review } = req.body;

        // Validate input
        if (!productId || !rating || rating < 1 || rating > 5) {
            return res.status(400).send(error_function({
                statusCode: 400,
                message: 'Valid Product ID, rating (1-5), and review text are required.'
            }));
        }

        // Check if the user has already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: req.user._id });
        if (existingReview) {
            return res.status(400).send(error_function({
                statusCode: 400,
                message: 'You have already reviewed this product.'
            }));
        }

        // Create a new review
        const newReview = await Review.create({
            product: productId,
            user: req.user._id, // Assuming user is authenticated
            rating,
            review,
        });

        // Optionally update product rating (if needed)
        const product = await Product.findById(productId);
        if (product) {
            const reviews = await Review.find({ product: productId });
            const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
            product.rating = avgRating;
            await product.save();
        }

        res.status(201).json({
            message: "Review added successfully",
            data: newReview,
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            message: "Error adding review: " + error.message,
        });
    }
};
