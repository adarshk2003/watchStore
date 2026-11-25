const mongoose = require('mongoose');

const order = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, min: 0 },
        },
    ],
    address:{ type: String, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash'], default: 'cash' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

order.index({ userId: 1, createdAt: -1 });
order.index({ createdAt: -1, _id: -1 });
order.index({ 'products.productId': 1 });

module.exports = mongoose.model('order', order);