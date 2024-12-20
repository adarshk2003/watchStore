const mongoose = require('mongoose');

const seller= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    businessAddress: {
        type: String,
        required: true
    },
    businessRegistrationNumber: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: false
    },
    shippingMethods: {
        type: String,
        required: true
    },
    returnPolicy: {
        type: String,
        required: true
    },
    shippingLocations: {
        type: String,
        required: true
    },
    sellerBio: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("seller", seller);
