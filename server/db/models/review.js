const mongoose = require('mongoose');

const review = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: [1],
        max: [5],
    },
    review: {
        type: String,
        required: false, 
    },
}, { timestamps: true });
review.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("review", review);
