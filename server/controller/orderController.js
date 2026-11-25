const order = require('../db/models/orders');
const jwt = require('jsonwebtoken');
const Product = require('../db/models/product');
const { success_function, error_function } = require('../utils/response-handler');
const Cart=require('../db/models/cart')
const mongoose = require('mongoose');

const checkoutFees = 48;

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

exports.createOrder = [
    authenticate, // Middleware to authenticate the user
    async (req, res) => {
        try {
            // Extract userId from req.user, set by the authentication middleware
            const userId = req.user.id;

            // Extract order details from the request body
            const { products, address, paymentMethod, expectedTotal } = req.body;

            // Validate order details
            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: 'Products are required and must be an array.' });
            }
            if (typeof address !== 'string' || !address.trim()) {
                return res.status(400).json({ message: 'Address is required.' });
            }
            if (paymentMethod !== 'cash') {
                return res.status(400).json({ message: 'Only cash on delivery is currently available.' });
            }
            if (
                expectedTotal !== undefined &&
                (typeof expectedTotal !== 'number' || !Number.isFinite(expectedTotal) || expectedTotal <= 0)
            ) {
                return res.status(400).json({ message: 'Invalid expected total.' });
            }

            const requestedQuantities = new Map();
            for (const item of products) {
                if (!item || !mongoose.Types.ObjectId.isValid(item.productId)) {
                    return res.status(400).json({ message: 'Invalid product ID.' });
                }
                if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
                    return res.status(400).json({ message: 'Product quantities must be positive integers.' });
                }

                const productId = new mongoose.Types.ObjectId(item.productId).toString();
                requestedQuantities.set(
                    productId,
                    (requestedQuantities.get(productId) || 0) + item.quantity
                );
                if (!Number.isSafeInteger(requestedQuantities.get(productId))) {
                    return res.status(400).json({ message: 'Combined product quantity is too large.' });
                }
            }

            let createdOrder;
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const productIds = [...requestedQuantities.keys()];
                    const productDocuments = await Product.find({ _id: { $in: productIds } }).session(session);
                    const productById = new Map(
                        productDocuments.map((product) => [product._id.toString(), product])
                    );
                    const orderProducts = [];
                    let subtotalInCents = 0;

                    for (const [productId, quantity] of requestedQuantities) {
                        const product = productById.get(productId);
                        if (!product) {
                            const error = new Error(`Product with ID ${productId} not found.`);
                            error.statusCode = 404;
                            throw error;
                        }

                        if (product.seller.toString() === userId) {
                            const error = new Error(`You cannot purchase your own product: ${product.title}.`);
                            error.statusCode = 400;
                            throw error;
                        }

                        if (product.isStatus) {
                            const error = new Error(`Product is unavailable: ${product.title}.`);
                            error.statusCode = 400;
                            throw error;
                        }

                        if (product.stock < quantity) {
                            const error = new Error(
                                `Not enough stock for product: ${product.title}. Available: ${product.stock}, Requested: ${quantity}`
                            );
                            error.statusCode = 409;
                            throw error;
                        }

                        const unitPriceInCents = Math.round(product.price * 100);
                        subtotalInCents += unitPriceInCents * quantity;
                        if (!Number.isSafeInteger(subtotalInCents)) {
                            const error = new Error('Order total is too large.');
                            error.statusCode = 400;
                            throw error;
                        }
                        orderProducts.push({
                            productId: product._id,
                            quantity,
                            unitPrice: unitPriceInCents / 100,
                        });
                    }

                    const computedTotal = (subtotalInCents + checkoutFees * 100) / 100;
                    if (
                        expectedTotal !== undefined &&
                        Math.round(expectedTotal * 100) !== Math.round(computedTotal * 100)
                    ) {
                        const error = new Error('Prices changed. Please return to your cart and review the updated total.');
                        error.statusCode = 409;
                        throw error;
                    }

                    const stockUpdates = orderProducts.map((item) => ({
                        updateOne: {
                            filter: {
                                _id: item.productId,
                                stock: { $gte: item.quantity },
                                isStatus: { $ne: true },
                            },
                            update: { $inc: { stock: -item.quantity } },
                        },
                    }));
                    const stockUpdateResult = await Product.bulkWrite(stockUpdates, { session });

                    if (stockUpdateResult.matchedCount !== stockUpdates.length) {
                        const error = new Error('Stock changed while placing your order. Please try again.');
                        error.statusCode = 409;
                        throw error;
                    }

                    const newOrder = new order({
                        userId,
                        products: orderProducts,
                        address: address.trim(),
                        total: computedTotal,
                        paymentMethod,
                        status: 'pending',
                    });
                    createdOrder = await newOrder.save({ session });

                    await Cart.updateOne(
                        { userId },
                        { $pull: { items: { productId: { $in: productIds } } } },
                        { session }
                    );
                });
            } catch (error) {
                if (error.statusCode) {
                    return res.status(error.statusCode).json({ message: error.message });
                }
                throw error;
            } finally {
                await session.endSession();
            }

            res.status(201).json({ message: 'Order created successfully', order: createdOrder });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];



exports.viewUserOrders = [
    authenticate, // Middleware to authenticate the user
    async (req, res) => {
        try {
            // Extract userId from req.user, set by the authentication middleware
            const userId = req.user.id;

            // Fetch orders for the authenticated user
            const userOrders = await order.find({ userId })
                .populate('products.productId', 'title brand price product_images')
                .populate('userId', 'name email')
                .lean();

            // Check if the user has any orders
            if (!userOrders || userOrders.length === 0) {
                return res.status(404).json({ message: 'No orders found for this user.' });
            }

            // Respond with the user's orders
            res.status(200).json({ message: 'Orders fetched successfully', orders: userOrders });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

exports.viewSellerOrders = [
    authenticate,
    async (req, res) => {
        try {
            const productIds = await Product.distinct('_id', { seller: req.user.id });

            if (productIds.length === 0) {
                return res.status(200).json({ message: 'Orders fetched successfully', data: [] });
            }

            const sellerOrders = await order.find({ 'products.productId': { $in: productIds } })
                .select('products createdAt status')
                .populate({
                    path: 'products.productId',
                    select: 'price seller',
                    match: { seller: req.user.id },
                })
                .lean();

            const salesData = sellerOrders.map((sellerOrder) => {
                const sellerItems = sellerOrder.products.filter((item) =>
                    item.productId && item.productId.seller.toString() === req.user.id
                );

                return {
                    createdAt: sellerOrder.createdAt,
                    status: sellerOrder.status,
                    total: sellerItems.reduce(
                        (subtotal, item) => subtotal + (item.unitPrice ?? item.productId.price) * item.quantity,
                        0
                    ),
                };
            });

            return res.status(200).json({ message: 'Orders fetched successfully', data: salesData });
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
];

exports.viewAllOrders = async function (req, res) {
    try {
        const hasPagination = Object.prototype.hasOwnProperty.call(req.query, 'page') ||
            Object.prototype.hasOwnProperty.call(req.query, 'limit');
        if (hasPagination) {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 25);
            if (!Number.isSafeInteger(page) || page < 1) {
                return res.status(400).json({ message: 'Page must be a positive integer.' });
            }
            if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({ message: 'Limit must be an integer between 1 and 100.' });
            }

            const [orderData, totalItems] = await Promise.all([
                order.find()
                    .sort({ createdAt: -1, _id: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('userId', 'name email phone')
                    .populate('products.productId', 'title brand price product_images')
                    .lean(),
                order.countDocuments(),
            ]);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: orderData,
                message: 'Orders fetched successfully',
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                },
            });
        }

        const orderData = await order.find()
            .populate("userId", "name email phone")
            .populate("products.productId")
            .lean();

        let response = success_function({
            statusCode: 200,
            data: orderData,
            message: "Orders fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;
    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
        return;
    }
};

exports.updateOrderStatus = [
    authenticate,
    async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status. Must be pending, completed, or cancelled.'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ message: 'Invalid order ID format.' });
            }

            const updatedOrder = await order.findByIdAndUpdate(
                orderId,
                { status },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found.' });
            }

            return res.status(200).json({
                message: 'Order status updated successfully.',
                order: updatedOrder
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            return res.status(500).json({
                message: error.message || 'An error occurred while updating the order status.'
            });
        }
    }
];
