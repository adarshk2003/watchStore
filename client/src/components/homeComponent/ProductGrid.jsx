import React, { useEffect, useState, useMemo, useRef } from "react";
import { addToCart } from "./cartUtil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from './wishlistUtil';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProductGrid({ selectedProducts }) {
  const productSectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Display 12 products per page

  const baseUrl = "https://watchstore-backends.onrender.com";
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchCartItems(), fetchProducts(), fetchWishlist()]);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      console.log("No token found.");
    }
  }, [token]);

  const fetchCartItems = async () => {
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(localCart);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/viewCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartProductIds = response.data.items.map((item) => item.productId._id);
      setCartItems(cartProductIds);
      localStorage.setItem("cartItems", JSON.stringify(cartProductIds));
    } catch (err) {
      console.error("Error fetching cart items:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/products`);
      const allProducts = response.data.data;

      const allBrands = [...new Set(allProducts.map(product => product.brand))];
      const allCategories = [...new Set(allProducts.map(product => product.category))];

      setBrands(allBrands);
      setCategories(allCategories);

      const visibleProducts = allProducts.filter(product => !product.isStatus);
      const sortedProducts = visibleProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(sortedProducts);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${baseUrl}/viewWishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistItems(response.data.items.map((item) => item.productId._id));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const { success, updatedItems } = await addToCart(productId, setCartItems);
    if (success) {
      const updatedCart = [...cartItems, productId];
      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
  };

  const handleProductCardClick = (productId) => {
    navigate(`/product/${productId}`, { replace: false });
  };

  const handleAddToWishlist = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (wishlistItems.includes(productId)) {
      removeFromWishlist(productId, token, setWishlistItems);
    } else {
      addToWishlist(productId, token, setWishlistItems);
    }
  };

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesPriceRange = selectedPriceRange === '' ||(
        selectedPriceRange === '100-1000' && product.price >= 100 && product.price <= 1000
      )|| (
        selectedPriceRange === '1000-10000' && product.price >= 1000 && product.price <= 10000
      ) || (
        selectedPriceRange === '10000-above' && product.price > 10000
      );

      const matchesBrand = selectedBrand === '' || product.brand.toLowerCase().includes(selectedBrand.toLowerCase());

      const matchesCategory = selectedCategory === '' || product.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesPriceRange && matchesBrand && matchesCategory;
    });
  }, [products, selectedPriceRange, selectedBrand, selectedCategory]);

  // Get New Arrivals - Products created in the last 7 days
  const getNewArrivals = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 7 days ago
    return products.filter((product) => new Date(product.createdAt) >= oneWeekAgo);
  }, [products]);

  // Combine selected products with filtered products for display
  const finalProductsToDisplay = useMemo(() => {
    return [...selectedProducts, ...filteredProducts];
  }, [selectedProducts, filteredProducts]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = finalProductsToDisplay.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(finalProductsToDisplay.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-opacity-30 border-blue-500"></div>
          {/* Main Spinner */}
          <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-700">Loading, please wait...</p>
      </div>
    );
  
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-16 h-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.34 3.05a8.38 8.38 0 013.32 0c1.4.27 2.68.92 3.73 1.93a8.78 8.78 0 012.25 6.74c-.18 2.47-.97 4.5-2.29 5.97a8.93 8.93 0 01-5.4 3.22c-1.58.27-3.18.09-4.63-.52-1.4-.58-2.64-1.47-3.63-2.65a8.99 8.99 0 01-1.82-6.09c.24-2.66 1.36-4.92 3.15-6.62a9.17 9.17 0 015.32-2.14z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-600">Oops!</h2>
          <p className="text-gray-700 text-lg mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  

  return (
    <div>
      <div className="filters flex flex-wrap gap-4 p-4">
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          className="border p-2 rounded-md outline-none w-full sm:w-auto"
        >
          <option value="">Filter by Price</option>
          <option value="100-1000">₹100 - ₹1000</option>
          <option value="1000-10000">₹1000 - ₹10000</option>
          <option value="10000-above">₹10000 and above</option>
        </select>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border p-2 rounded-md outline-none w-full sm:w-auto"
        >
          <option value="">Filter by Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-md outline-none w-full sm:w-auto"
        >
          <option value="">Filter by Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* New Arrivals Section */}
      {getNewArrivals.length > 0 && (
        <div className="new-arrivals p-4 bg-gray-100">
          <h2 className="text-xl font-semibold">New Arrivals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {getNewArrivals.map((product) => {
              const isInCart = cartItems.includes(product._id);
              const isInWishlist = wishlistItems.includes(product._id);

              const imageUrl =
  product.product_images && product.product_images.length > 0
    ? product.product_images[0] // Already a full Cloudinary URL
    : "/public/rolex.jpg"; // Fallback image


              return (
                <div
                  key={product._id}
                  className="max-w-xs w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl"
                  onClick={() => handleProductCardClick(product._id)}
                >
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-60 w-full object-cover rounded-t-xl"
                  />
                  <div className="px-4 py-3">
                    <span className="text-gray-400 mr-3 uppercase text-xs">
                      {product.brand || "Unknown Brand"}
                    </span>
                    <p className="text-lg font-bold text-black truncate block capitalize">
                      {product.title}
                    </p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold text-black cursor-auto my-3">
                      ₹{product.price || "N/A"}
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
                            handleAddToCart(product._id);
                          }}
                          className={`px-4 py-2 rounded-md ${isInCart
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-900 hover:bg-emerald-700 text-white"
                            }`}
                          disabled={isInCart}
                        >
                          {isInCart ? "In Cart" : "Add to Cart"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(product._id);
                        }}
                        className={`p-2 rounded-full w-9 h-9 ${isInWishlist ? 'bg-red-600' : 'bg-black'}`}
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`text-lg ${isInWishlist ? 'text-white' : 'text-white'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Display products */}
      <div
        ref={productSectionRef}
        className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-10"
      >
        {currentProducts.map((product) => {
          const isInCart = cartItems.includes(product._id);
          const isInWishlist = wishlistItems.includes(product._id);

          const imageUrl =
  product.product_images && product.product_images.length > 0
    ? product.product_images[0] // Already a full Cloudinary URL
    : "/public/rolex.jpg"; // Fallback image


          return (
            <div
              key={product._id}
              className="max-w-xs w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl"
              onClick={() => handleProductCardClick(product._id)}
            >
              <img
                src={imageUrl}
                alt={product.title}
                className="h-60 w-full object-cover rounded-t-xl"
              />
              <div className="px-4 py-3">
                <span className="text-gray-400 mr-3 uppercase text-xs">
                  {product.brand || "Unknown Brand"}
                </span>
                <p className="text-lg font-bold text-black truncate block capitalize">
                  {product.title}
                </p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">
                  ₹{product.price || "N/A"}
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
                        handleAddToCart(product._id);
                      }}
                      className={`px-4 py-2 rounded-md ${isInCart
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-900 hover:bg-emerald-700 text-white"
                        }`}
                      disabled={isInCart}
                    >
                      {isInCart ? "In Cart" : "Add to Cart"}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product._id);
                    }}
                    className={`p-2 rounded-full w-9 h-9 ${isInWishlist ? 'bg-red-600' : 'bg-black'}`}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      className={`text-lg ${isInWishlist ? 'text-white' : 'text-white'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="pagination flex justify-center gap-4 py-4">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-md ${index + 1 === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
        {/* popular brands */}
        <div>
          
        </div>
        {/* explore clyro */}
    </div>
  );
}

export default ProductGrid;
