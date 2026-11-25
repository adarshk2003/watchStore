const mongoose = require('mongoose');

const product = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "No description provided",
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    brand: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    model: {
        type: String,
        required: true,
    },
    caseMaterial: {
        type: String,
        required: true,
    },
    dial: {
        type: String,
        required: true,
    },
    bracelet: {
        type: String,
        required: true,
    },
    movement: {
        type: String,
        required: true,
    },
    power: {
        type: Number,
        required: true,
    },
    waterResestence: {
        type: Number,
        required: false,
    },
    waterResistance: {
        type: Number,
        required: false,
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    ratingsCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    crystal: {
        type: String,
        required: false,
    },
    product_images: {
        type: [String],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    isStatus: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

product.index({ seller: 1 });
product.index({ createdAt: -1, _id: -1 });
product.index({ category: 1, createdAt: -1, _id: -1 });
product.index({ brand: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model("products", product);
