const products = require('../db/models/product');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const jwt = require('jsonwebtoken')
const { fileUpload } = require('../utils/fileUpload')
const { sendEmail } = require('../utils/sendemail');
const mongoose = require('mongoose')


//auth
const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    console.log(authorizationHeader);

    //extract token 
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
    console.log("extracted token : ", token);

    if (!token) {
        return res.status(401).json({ message: "please login" });

    }
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id };
        console.log("decoded user id:", req.user.id);
        next()
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}


exports.addProduct = [authenticate, async (req, res) => {
    try {
        // Destructure the form data from the request body
        const {
            title,
            category,
            price,
            brand,
            stock,
            model,
            caseMaterial,
            bracelet,
            movement,
            waterResestence,
            crystal,
            dial,
            power,
            description,
            product_images,
        } = req.body;

        // Validate product_images array
        if (!Array.isArray(product_images) || product_images.length === 0) {
            return res.status(400).json({ message: "product_images must be an array and cannot be empty." });
        }

        // Call the fileUpload function with the array of base64 image strings
        const uploadedImagePaths = await fileUpload(product_images, 'products');

        // Create a new product record in the database with the uploaded image paths
        const product = new products({
            title,
            category,
            price,
            brand,
            stock,
            model,
            caseMaterial,
            bracelet,
            movement,
            waterResestence,
            crystal,
            dial,
            power,
            description,
            product_images: uploadedImagePaths,
            seller: req.user.id,
        });

        // Save the product to the database
        await product.save();

        // Return a success response with the created product data
        return res.status(201).json({
            message: "Product added successfully",
            data: product
        });

    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({
            message: "An error occurred while adding the product. Please try again.",
            error: error.message || error
        });
    }
}];


//view products

exports.viewProducts = async function (req, res) {
    try {


        let productData = await products.find().populate('seller', 'name');
        console.log(productData);


        let response = success_function({
            statusCode: 200,
            data: productData,
            message: "products fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;
    }
    catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }

}

//view single product

exports.viewSingleProduct = async function (req, res) {
    try {
        let id = req.params.id;
        console.log("id : ", id);
        if (!id) {
            return res.status(400).send('Product ID is required.');
        }
        let productData = await products.findOne({ _id: id });
        console.log("productdata : ", productData);
        if (!productData) {
            return res.status(404).send('Product not found.');
        }
        res.status(200).send(productData);
        return;
    } catch (error) {
        console.log("error : ", error);
        res.status(400).send(error.message ? error.message : error);
    }
}

//view sellers product uploads
exports.viewProductsByUser = [authenticate, async (req, res) => {
    try {
        const userId = req.user.id;


        const userProducts = await products.find({ userId });

        return res.status(200).json({
            message: userProducts.length
                ? "Products fetched successfully."
                : "No products found for this user.",
            data: userProducts,
        });
    } catch (error) {
        console.error("Error fetching user products:", error);
        return res.status(500).json({
            message: error.message || "An error occurred while fetching products.",
        });
    }
}];


// View products by category
exports.viewProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params; // Extract category from URL
        console.log("Requested category:", category);

        // Fetch products matching the category
        const product = await products.find({ category: category });

        // Respond with filtered products
        if (product.length > 0) {
            return res.status(200).json({
                message: "Products fetched successfully",
                data: product,
            });
        } else {
            return res.status(404).json({
                message: "No products found in this category",
            });
        }
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return res.status(500).json({
            message: error.message || "An error occurred while fetching products",
        });
    }
};

//view products uploaded by user for admin
exports.getProductsByUser = async (req, res) => {
    const { userId } = req.params; // Extract userId from the request parameters
    console.log('User ID received:', userId); // Log the userId to ensure it's correct

    try {
        // Ensure userId is converted to ObjectId
        const productsList = await products.find({ seller: new mongoose.Types.ObjectId(userId) });

        console.log('Fetched products list:', productsList);  // Log the fetched products

        // Check if products exist for the given user
        if (!productsList || productsList.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found for this user.',
            });
        }

        // Return the products
        return res.status(200).json({
            success: true,
            data: productsList,
        });
    } catch (error) {
        // Debug error
        console.error('Error fetching products by userId:', error);

        // Handle server errors
        return res.status(500).json({
            success: false,
            message: 'Server Error. Could not fetch products.',
        });
    }
};




// Controller to block a product
exports.blockProduct = [authenticate, async function (req, res) {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format.' });
    }
    try {
        const product = await products.findByIdAndUpdate(productId, { isStatus: true }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'product not found.' });
        }
        res.status(200).json({ message: 'product blocked successfully.', product });
        console.log("product blocked successfully", product);
    } catch (error) {
        console.error('Error blocking product:', error);
        res.status(500).json({ message: 'Error blocking product.', error: error.message });
    }

}];

//Controller to unblock a product

exports.unblockProduct = [authenticate, async function (req, res) {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format.' });
    }
    try {
        const product = await products.findByIdAndUpdate(productId, { isStatus: false }, { new: true });
        if (!product) {
            // User not found
            return res.status(404).json({ message: 'product not found.' });
        }
        res.status(200).json({ message: 'product  unblocked successfully.', product });
        console.log("product unblocked successfully", product);

    } catch (error) {
        console.error('Error unblocking product:', error);
        res.status(500).json({ message: 'Error unblocking product.', error: error.message });

    }
}];

//update product
exports.updateProduct = [
    authenticate,
    async (req, res) => {
        try {
            console.log("Request Params:", req.params); // Log all route params
            console.log("Request Body:", req.body); // Log body for debugging

            const { productId } = req.params;

            // Check if productId is missing
            if (!productId) {
                return res.status(400).json({ message: "Product ID is missing from the URL." });
            }

            // Validate productId format
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "Invalid Product ID format." });
            }

            // Proceed with finding and updating the product
            const updateData = req.body;
            const userId = req.user.id;

            // Check if the product belongs to the user
            const product = await products.findOne({ _id: productId, userId });
            if (!product) {
                return res.status(404).json({ message: "Product not found or unauthorized." });
            }

            // Update the product
            const updatedProduct = await products.findByIdAndUpdate(productId, updateData, {
                new: true,
                runValidators: true,
            });

            // Return updated product data in the response
            return res.status(200).json({
                message: "Product updated successfully.",
                data: updatedProduct,
            });
        } catch (error) {
            console.error("Error updating product:", error);
            return res.status(500).json({ message: "An error occurred.", error: error.message });
        }
    },
];
