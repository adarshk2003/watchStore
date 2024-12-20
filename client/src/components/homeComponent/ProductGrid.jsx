import React, { useEffect, useState, useRef } from "react";
import { addToCart } from "./cartUtil";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { removeFromWishlist, addToWishlist } from "./wishlistUtil";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProductGrid() {
    const productSectionRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    const baseUrl = "http://localhost:7000";
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${baseUrl}/products`);
                const allProducts = response.data.data;
                const sortedProducts = allProducts.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setProducts(sortedProducts);
                setLoading(false);
            } catch (err) {
                setError(
                    err.response?.data?.message || err.message || "Something went wrong"
                );
                setLoading(false);
            }
        };

        const fetchWishlist = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${baseUrl}/viewWishlist`, {
                    headers: { Authorization: `bearer ${token}` },
                });
                setWishlistItems(
                    response.data.items.map((item) => item.productId._id)
                );
            } catch (err) {
                console.error("Error fetching wishlist:", err);
            }
        };

        fetchProducts();
        fetchWishlist();
    }, [token]);

    const handleProductCardClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const filteredProducts = products.filter(
        (product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div
            ref={productSectionRef}
            className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-10"
        >
            {(searchQuery ? filteredProducts : products).map((product) => {
                const isInCart = cartItems.includes(product._id);
                const productTitle = product.title
                    ? product.title.split(" - ")[0]
                    : "Unnamed Product";
                const isInWishlist = wishlistItems.includes(product._id);

                const imageUrl =
                    product.product_images && product.product_images.length > 0
                        ? product.product_images[0].startsWith("uploads/products/")
                            ? `${baseUrl}/${product.product_images[0]}`
                            : `${baseUrl}/uploads/products/${product.product_images[0]}`
                        : "/public/rolex.jpg"; // Fallback image

                return (
                    <div
                        key={product._id}
                        className="max-w-xs w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl"
                        onClick={() => handleProductCardClick(product._id)}
                    >
                        <img
                            src={imageUrl}
                            alt={productTitle}
                            className="h-60 w-full object-cover rounded-t-xl"
                        />
                        <div className="px-4 py-3">
                            <span className="text-gray-400 mr-3 uppercase text-xs">
                                {product.brand || "Unknown Brand"}
                            </span>
                            <p className="text-lg font-bold text-black truncate block capitalize">
                                {productTitle}
                            </p>
                            <div className="flex items-center">
                                <p className="text-lg font-semibold text-black cursor-auto my-3">
                                    €{product.price || "N/A"}
                                </p>
                            </div>
                            <p
                                className={`text-sm font-semibold my-2 ${product.stock > 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                            >
                                {product.stock > 0
                                    ? `${product.stock} in stock`
                                    : "Out of Stock"}
                            </p>
                            <div className="flex items-center justify-between">
                                {product.stock > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isInCart) {
                                                addToCart(product._id, setCartItems); // Ensure this updates state
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-md ${isInCart
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-emerald-900 hover:bg-emerald-700 text-white"
                                            }`}
                                        disabled={isInCart}  // Disable the button if the item is in cart
                                    >
                                        {isInCart ? "In Cart" : "Add to Cart"}
                                    </button>
                                )}

                                <FaHeart
                                    className={`text-xl cursor-pointer ${isInWishlist
                                            ? "text-red-500"
                                            : "text-gray-400"
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWishlistToggle(
                                            product._id,
                                            isInWishlist
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ProductGrid;
