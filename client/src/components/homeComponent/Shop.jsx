import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'rc-slider';
import { addToCart } from './cartUtil';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { addToWishlist, removeFromWishlist } from './wishlistUtil';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import 'rc-slider/assets/index.css';
import NavBaruser from "../navComponent/userNav";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000000]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  const baseUrl = 'http://localhost:7000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchCartItems(), fetchWishlist()]);
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

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`${baseUrl}/products`, config)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          const productsData = response.data.data;
          setProducts(productsData);

          const uniqueBrands = [...new Set(productsData.map((p) => p.brand))];
          const uniqueCategories = [
            ...new Set(productsData.map((p) => p.category)),
          ];

          setBrands(uniqueBrands);
          setCategories(uniqueCategories);
        } else {
          throw new Error('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setError('Error fetching products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const filteredProducts = products.filter((product) => {
    return (
      !product.isStatus &&
      product.price >= selectedPriceRange[0] &&
      product.price <= selectedPriceRange[1] &&
      (selectedBrand ? product.brand === selectedBrand : true) &&
      (selectedCategory ? product.category === selectedCategory : true)
    );
  });

  const productsPerPage = 16;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
  };

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

  const handlePagination = (pageNum) => {
    setPage(pageNum);
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const { success } = await addToCart(productId, setCartItems);
    if (success) {
      const updatedCart = [...cartItems, productId];
      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
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

  const handleProductCardClick = (productId) => {
    navigate(`/product/${productId}`, { replace: false });
  };

  return (
    <>
      <NavBaruser />
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden fixed top-16 left-4 z-50 p-3 bg-blue-500 text-white rounded-full shadow-md"
        >
          <FaFilter className="text-lg" />
        </button>

        <div
          className={`col-span-1 bg-white shadow-md rounded-lg p-4 h-screen overflow-y-auto transform lg:translate-x-0 transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'
            } lg:static fixed top-0 left-0 w-4/5 sm:w-2/5 lg:w-full z-40`}
        >
          <h2 className="text-2xl font-semibold mb-4">Filters</h2>
          <h3 className="text-lg font-semibold mb-2">Filter by Price</h3>
          <Slider
            range
            min={0}
            max={1000000}
            step={100}
            value={selectedPriceRange}
            onChange={handlePriceChange}
            trackStyle={[{ backgroundColor: '#4CAF50' }]}
            handleStyle={[{ borderColor: '#4CAF50', backgroundColor: '#4CAF50' }]}
            railStyle={{ backgroundColor: '#e5e7eb' }}
          />
          <div className="flex justify-between mt-2 text-gray-700">
            <span>₹{selectedPriceRange[0]}</span>
            <span>₹{selectedPriceRange[1]}</span>
          </div>
          <h3 className="text-lg font-semibold mt-4 mb-2">Filter by Brand</h3>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="border p-2 rounded-md outline-none w-full"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <h3 className="text-lg font-semibold mt-4 mb-2">Filter by Category</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded-md outline-none w-full"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3 bg-gray-50 overflow-y-auto p-4 no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const imageUrl =
                product.product_images && product.product_images.length > 0
                  ? `${baseUrl}/${product.product_images[0]}`
                  : 'https://via.placeholder.com/150';

              const isInCart = cartItems.includes(product._id);
              const isInWishlist = wishlistItems.includes(product._id);

              return (
                <div
                  key={product._id}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-200"
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-4 cursor-pointer"
                    onClick={() => handleProductCardClick(product._id)}
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  <p className="font-bold text-xl mb-2">₹{product.price}</p>
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
              );
            })}
          </div>
          <div className="flex justify-center mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePagination(i + 1)}
                className={`px-4 py-2 mx-1 border rounded-lg ${page === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-500'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
