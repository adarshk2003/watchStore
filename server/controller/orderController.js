const order = require('../db/models/orders');
const jwt = require('jsonwebtoken');
const Product = require('../db/models/product');
const { success_function, error_function } = require('../utils/response-handler');
const Cart=require('../db/models/cart')

const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    console.log("Authorization Header:", authorizationHeader);

    // Extract token from header
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
    console.log("Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: "No token provided. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id }; // Add user ID to the request
        console.log("Decoded User ID:", req.user.id);
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
            const { products, address, total, paymentMethod } = req.body;

            // Validate order details
            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: 'Products are required and must be an array.' });
            }
            if (!address) {
                return res.status(400).json({ message: 'Address is required.' });
            }
            if (total == null || total <= 0) {
                return res.status(400).json({ message: 'Invalid total amount.' });
            }
            if (!paymentMethod) {
                return res.status(400).json({ message: 'Payment method is required.' });
            }

            console.log("Order Details:", { userId, products, address, total, paymentMethod });

            // Validate stock availability and seller check for each product
            for (const item of products) {
                const product = await Product.findById(item.productId); // Use `Product` model to find the product

                if (!product) {
                    return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
                }

                console.log(`Product seller for product ${item.productId}: ${product.seller}`);

                // Check if the logged-in user is the seller of the product
                if (product.seller.toString() === userId) {
                    return res.status(400).json({
                        message: `You cannot purchase your own product: ${product.title}.`,
                    });
                }

                // Check stock availability
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Not enough stock for product: ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`,
                    });
                }
            }

            // Create a new order document
            const newOrder = new order({
                userId,
                products, // Example: [{ productId: "123", quantity: 2 }]
                address,
                total,
                paymentMethod, // Example: 'credit_card', 'paypal', etc.
                status: 'pending', // Default order status
            });

            // Save the order to the database
            const savedOrder = await newOrder.save();

            // Decrease stock for each product
            for (const item of products) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity } }, // Decrease stock
                    { new: true } // Return the updated document
                );
            }

            // Update the cart to remove only the purchased items
      const cart = await Cart.findOne({ userId });
      if (cart) {
        // Filter out the items that were purchased from the cart
        const updatedCartItems = cart.items.filter(item => 
          !products.some(product => product.productId.toString() === item.productId.toString())
        );

        cart.items = updatedCartItems; // Update the cart with remaining items
        await cart.save();
      }

      // Respond with the created order
      res.status(201).json({ message: 'Order created successfully', order: savedOrder });
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
                .populate('products.productId', 'name price') // Populate product details
                .populate('userId', 'name email'); // Populate user details (optional)

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

exports.viewAllOrders = async function (req, res) {
    try {
        let orderData = await order.find()
            .populate("userId", "name email phone")
            .populate("products.productId");
        console.log(orderData);

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
}
