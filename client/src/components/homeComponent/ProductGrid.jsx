import React, { useEffect, useState, useMemo, useRef } from "react";
import { addToCart } from "./cartUtil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from './wishlistUtil';
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
  const navigate = useNavigate();  // To navigate to the login page

  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const baseUrl = "http://localhost:7000";
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
      navigate("/login"); // Redirect to login page if not logged in
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
      navigate("/login"); // Redirect to login page if not logged in
      return;
    }

    if (wishlistItems.includes(productId)) {
      removeFromWishlist(productId, token, setWishlistItems);
    } else {
      addToWishlist(productId, token, setWishlistItems);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearchQuery =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriceRange = selectedPriceRange === '' ||(
        selectedPriceRange === '100-1000' && product.price >= 100 && product.price <= 1000
      )|| (
        selectedPriceRange === '1000-10000' && product.price >= 1000 && product.price <= 10000
      ) || (
        selectedPriceRange === '10000-above' && product.price > 10000
      );

      const matchesBrand = selectedBrand === '' || product.brand.toLowerCase().includes(selectedBrand.toLowerCase());

      const matchesCategory = selectedCategory === '' || product.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearchQuery && matchesPriceRange && matchesBrand && matchesCategory;
    });
  }, [products, searchQuery, selectedPriceRange, selectedBrand, selectedCategory]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="filters flex gap-4 p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2"
        />
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          className="border p-2 rounded-md outline-none"
        >
          <option value="">Filter by Price</option>
          <option value="100-1000">€100 - €1000</option>
          <option value="1000-10000">€1000 - €10000</option>
          <option value="10000-above">€10000 and above</option>
        </select>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border p-2 rounded-md outline-none "
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
          className="border p-2 rounded-md outline-none"
        >
          <option value="">Filter by Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={productSectionRef}
        className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-10"
      >
        {filteredProducts.map((product) => {
          const isInCart = cartItems.includes(product._id);
          const isInWishlist = wishlistItems.includes(product._id);

          const imageUrl = product.product_images && product.product_images.length > 0
            ? `${baseUrl}/${product.product_images[0]}`
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
  );
}

export default ProductGrid;
