import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function OthersProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const baseUrl = 'https://watchstore-backends.onrender.com';
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/products`, {
          headers: {
            Authorization: `bearer ${token}`,
          },
        });

        const allProducts = response.data.data;
        const visibleProducts = allProducts.filter(product => !product.isStatus);
        const sortedProducts = visibleProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filter products that are not added by the current user (this is for when another seller is viewing)
        const productsNotAddedByUser = allProducts.filter(
          (product) =>
            (product.userId && product.userId._id !== userId) || 
            (product.seller && product.seller._id !== userId) || 
            (product.createdBy && product.createdBy._id !== userId)
        );

        setProducts(sortedProducts);
        setFilteredProducts(productsNotAddedByUser);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${baseUrl}/viewWishlist`, {
          headers: { Authorization: `bearer ${token}` },
        });
        setWishlistItems(response.data.items.map((item) => item.productId._id));
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [token, userId]);

  const isInWishlist = (productId) => wishlistItems.includes(productId);

  // Filter products based on search query
  const searchProducts = (productsToSearch) => {
    return productsToSearch.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // If there is a search query, filter from the products list, else use filtered products
  const productsToDisplay = searchQuery
    ? searchProducts(filteredProducts) // If searching, filter from filteredProducts
    : filteredProducts; // Otherwise, show the unfiltered list

  return (
    <div className="container mx-auto my-8 px-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Browse Products</h3>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading products...</p>}
      
      {/* Error State */}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.isArray(productsToDisplay) && productsToDisplay.map((product) => (
          <div key={product._id} className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105">
            <img
              src={
                product.product_images && product.product_images.length > 0
                  ? `${baseUrl}/${product.product_images[1]}`
                  : './public/images/default-image.png' // Fallback to a default image
              }
              alt={product.title}
              className="w-full h-40 object-cover hover:cursor-pointer"
              onClick={() => navigate(`/products/${product._id}`)}
            />
            <div className="p-4">
              <h4 className="text-lg font-bold capitalize">{product.title}</h4>
              <p className="text-gray-900 font-semibold mt-2">₹ {product.price}</p>
              <h4 className="text-md font-semibold text-gray-700 mt-2 line-clamp-1">{product.description}</h4>
              <p className="text-gray-500 mt-2 capitalize">{product.category}</p>
              {isInWishlist(product._id) && (
                <p className="text-green-500 text-sm mt-2">In Wishlist</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
