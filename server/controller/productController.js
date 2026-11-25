const products = require('../db/models/product');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const jwt = require('jsonwebtoken')
const { fileUpload } = require('../utils/fileUpload')
const { sendEmail } = require('../utils/sendemail');
const mongoose = require('mongoose')

const defaultProductPageSize = 16;
const maxProductPageSize = 100;

function parseCatalogPagination(query) {
    if (
        !Object.prototype.hasOwnProperty.call(query, 'page') &&
        !Object.prototype.hasOwnProperty.call(query, 'limit')
    ) {
        return null;
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? defaultProductPageSize);
    if (!Number.isSafeInteger(page) || page < 1) {
        return { error: 'Page must be a positive integer.' };
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > maxProductPageSize) {
        return { error: `Limit must be an integer between 1 and ${maxProductPageSize}.` };
    }

    return { page, limit, skip: (page - 1) * limit };
}

function buildCatalogFilter(query, { category } = {}) {
    const filter = {};
    if (
        query.availableOnly !== undefined &&
        query.availableOnly !== 'true' &&
        query.availableOnly !== 'false'
    ) {
        return { error: 'availableOnly must be true or false.' };
    }
    if (query.availableOnly === 'true') filter.isStatus = { $ne: true };
    if (category) filter.category = category;
    else if (query.category) {
        if (typeof query.category !== 'string' || query.category.length > 100) {
            return { error: 'Category must be 100 characters or fewer.' };
        }
        filter.category = query.category;
    }
    if (query.brand) {
        if (typeof query.brand !== 'string' || query.brand.length > 100) {
            return { error: 'Brand must be 100 characters or fewer.' };
        }
        const escapedBrand = query.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.brand = { $regex: `^${escapedBrand}$`, $options: 'i' };
    }

    const minPrice = query.minPrice === undefined ? undefined : Number(query.minPrice);
    const maxPrice = query.maxPrice === undefined ? undefined : Number(query.maxPrice);
    if (
        (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
        (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    ) {
        return { error: 'Price filters must be non-negative numbers with minimum no greater than maximum.' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (query.q !== undefined && typeof query.q !== 'string') {
        return { error: 'Search text must be a string.' };
    }
    const search = typeof query.q === 'string' ? query.q.trim() : '';
    if (search.length > 100) {
        return { error: 'Search text must be 100 characters or fewer.' };
    }
    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
            { title: { $regex: escapedSearch, $options: 'i' } },
            { category: { $regex: escapedSearch, $options: 'i' } },
        ];
    }

    return { filter };
}

async function fetchPaginatedProducts({ filter, pagination, includeSeller = false, includeFacets = false }) {
    const listQuery = products.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit);
    if (includeSeller) listQuery.populate('seller', 'name');

    const [data, totalItems, brands, categories] = await Promise.all([
        listQuery.lean(),
        products.countDocuments(filter),
        includeFacets ? products.distinct('brand', { isStatus: { $ne: true } }) : Promise.resolve(undefined),
        includeFacets ? products.distinct('category', { isStatus: { $ne: true } }) : Promise.resolve(undefined),
    ]);

    const response = {
        success: true,
        statusCode: 200,
        data,
        message: 'Products fetched successfully',
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            totalItems,
            totalPages: Math.ceil(totalItems / pagination.limit),
        },
    };
    if (includeFacets) response.facets = { brands, categories };
    return response;
}


//auth
const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');

    //extract token 
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
        return res.status(401).json({ message: "please login" });

    }
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id };
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
        if (
            !Array.isArray(product_images) ||
            product_images.length === 0 ||
            product_images.length > 5 ||
            product_images.some((image) => typeof image !== 'string' || image.length > 2800000)
        ) {
            return res.status(400).json({ message: "Provide between 1 and 5 images, each no larger than 2 MB." });
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
        const pagination = parseCatalogPagination(req.query);
        if (pagination?.error) {
            return res.status(400).json({ message: pagination.error });
        }
        if (pagination) {
            const { filter, error } = buildCatalogFilter(req.query);
            if (error) return res.status(400).json({ message: error });

            const response = await fetchPaginatedProducts({
                filter,
                pagination,
                includeSeller: true,
                includeFacets: req.query.includeFacets === 'true' && pagination.page === 1,
            });
            return res.status(200).send(response);
        }

        const productData = await products.find()
            .populate('seller', 'name')
            .lean();


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
exports.deleteProduct = [
    authenticate,
    async (req, res) => {
      try {
        const userId = req.user.id; // Logged-in user's ID
        const { productId } = req.params; // Product ID from request params
  
        console.info(`[INFO]: Delete request received for Product ID: ${productId} by User ID: ${userId}`);
  
        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          console.warn(`[WARN]: Invalid Product ID: ${productId}`);
          return res.status(400).json({ message: "Invalid product ID." });
        }
  
        // Log the start of the search process
        console.debug(`[DEBUG]: Searching for product with ID: ${productId} and User ID: ${userId}`);
  
        // Find and delete the product if it exists and belongs to the logged-in user
        const product = await products.findOneAndDelete({
          _id: productId,
          $or: [
            { userId },
            { createdBy: userId },
            { seller: userId },
          ],
        });
  
        if (!product) {
          console.warn(`[WARN]: Product not found or user does not have permission. Product ID: ${productId}, User ID: ${userId}`);
          return res.status(404).json({
            message: "Product not found or you do not have permission to delete this product.",
          });
        }
  
        // Successful deletion
        console.info(`[INFO]: Product deleted successfully. Product ID: ${productId}, User ID: ${userId}`);
        return res.status(200).json({
          message: `Product "${product.title}" deleted successfully.`,
        });
  
      } catch (error) {
        // Log the error
        console.error(
          `[ERROR]: Error deleting product. User ID: ${req.user.id}, Product ID: ${req.params.productId}`,
          error
        );
  
        // Send response
        return res.status(500).json({
          message: "An error occurred while deleting the product. Please try again later.",
        });
      }
    },
  ];
//view single product

exports.viewSingleProduct = async function (req, res) {
    try {
        let id = req.params.id;
        if (!id) {
            return res.status(400).send('Product ID is required.');
        }
        const productData = await products.findOne({ _id: id }).lean();
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


        const userProducts = await products.find({ userId }).lean();

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

exports.getMyProducts = [authenticate, async (req, res) => {
    try {
        const userProducts = await products.find({ seller: req.user.id }).lean();
        return res.status(200).json({
            message: userProducts.length
                ? 'Products fetched successfully.'
                : 'No products found for this user.',
            data: userProducts,
        });
    } catch (error) {
        console.error('Error fetching seller inventory:', error);
        return res.status(500).json({ message: 'An error occurred while fetching seller inventory.' });
    }
}];

exports.getOtherProducts = [authenticate, async (req, res) => {
    try {
        const pagination = parseCatalogPagination(req.query);
        if (!pagination) {
            return res.status(400).json({ message: 'Pagination parameters are required.' });
        }
        if (pagination.error) {
            return res.status(400).json({ message: pagination.error });
        }

        const { filter, error } = buildCatalogFilter({ ...req.query, availableOnly: 'true' });
        if (error) return res.status(400).json({ message: error });
        filter.seller = { $ne: new mongoose.Types.ObjectId(req.user.id) };

        const response = await fetchPaginatedProducts({ filter, pagination });
        return res.status(200).send(response);
    } catch (error) {
        console.error("Error fetching other sellers' products:", error);
        return res.status(500).json({ message: 'An error occurred while fetching products.' });
    }
}];


// View products by category
exports.viewProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params; // Extract category from URL
        const pagination = parseCatalogPagination(req.query);
        if (pagination?.error) {
            return res.status(400).json({ message: pagination.error });
        }
        if (pagination) {
            const { filter, error } = buildCatalogFilter(req.query, { category });
            if (error) return res.status(400).json({ message: error });

            const response = await fetchPaginatedProducts({ filter, pagination });
            return res.status(200).send(response);
        }

        // Fetch products matching the category
        const product = await products.find({ category }).lean();

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
    try {
        // Ensure userId is converted to ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.',
            });
        }
        const productsList = await products.find({ seller: userId }).lean();

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

exports.updateProduct = [
    authenticate,
    async (req, res) => {
      try {
        const userId = req.user.id; // Logged-in user's ID
        const { productId } = req.params; // Product ID from request params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "Invalid product ID format." });
        }

        const product = await products.findOne({ _id: productId, seller: userId });

        if (!product) {
          return res.status(404).json({
            message:
              "Product not found or you do not have permission to update this product.",
          });
        }

        // Whitelist update fields to prevent mass assignment (e.g. overwriting seller or isStatus)
        const allowedFields = [
          'title', 'description', 'price', 'stock', 'brand', 'category', 'model',
          'caseMaterial', 'dial', 'bracelet', 'movement', 'power', 'waterResestence',
          'waterResistance', 'crystal', 'product_images'
        ];

        const updateData = {};
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ message: "No valid fields provided for update." });
        }

        const updatedProduct = await products.findByIdAndUpdate(
          productId,
          { $set: updateData },
          {
            new: true,
            runValidators: true,
          }
        );

        return res.status(200).json({
          message: "Product updated successfully.",
          data: updatedProduct,
        });
      } catch (error) {
        console.error("Error updating product:", error);

        return res.status(500).json({
          message:
            error.message || "An error occurred while updating the product.",
        });
      }
    },
  ];
   
