const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    businessAddress: {
        type: String,
        required: true
    }
    // Add additional seller-specific fields as needed
}, { timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema);
