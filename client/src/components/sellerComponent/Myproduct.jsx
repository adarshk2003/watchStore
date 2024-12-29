import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = 'http://localhost:7000';
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  const debugLog = (message, data = null) => {
    console.log(`[DEBUG]: ${message}`, data);
  };

  const truncateTitle = (title, maxLength = 29) => {
    if (title.length > maxLength) {
      return title.slice(0, maxLength) + '...';
    }
    return title;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        toast.error('Please login to continue');
        debugLog('No token found. Redirecting user to login.');
        return;
      }

      try {
        debugLog('Fetching products from server...');
        const response = await axios.get(`${baseUrl}/products`, {
          headers: {
            Authorization: `bearer ${token}`,
          },
        });

        debugLog('Fetched products response:', response.data);

        const allProducts = response.data.data;
        const userOwnedProducts = allProducts.filter((product) =>
          (product.userId && product.userId._id === userId) ||
          (product.seller && product.seller._id === userId) ||
          (product.createdBy && product.createdBy._id === userId)
        );

        debugLog('Filtered user-owned products:', userOwnedProducts);

        setUserProducts(userOwnedProducts);
        setProducts(allProducts);
        setLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
        debugLog('Error fetching products:', err);
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token, userId]);

  const handleDeleteProduct = async (productId) => {
    try {
      debugLog(`Deleting product with ID: ${productId}`);
      const response = await axios.delete(`${baseUrl}/products/${productId}`, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      debugLog('Product deleted successfully:', response.data);
      toast.success(response.data.message || 'Product deleted successfully');
      setUserProducts(userProducts.filter((product) => product._id !== productId));
    } catch (err) {
      debugLog('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleContactSupport = (productId, productTitle) => {
    debugLog(`Contacting support for product ID: ${productId}, Title: ${productTitle}`);
    navigate(`/support?productId=${productId}&productTitle=${encodeURIComponent(productTitle)}`);
  };

  // const handleEditProduct = (productId) => {
  //   debugLog(`Navigating to edit page for product ID: ${productId}`);
  //   navigate(`/products/${productId}`);
  // };

  return (
    <div className="container-fluid w-full">
      <div className="container mx-auto my-8 px-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">My Products</h3>

        {loading && <p className="text-gray-500">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.isArray(userProducts) && userProducts.map((product) => (
            <div
              key={product._id}
              className={`bg-white shadow-md rounded-lg overflow-hidden transition-transform transform ${
                product.isStatus ? '' : 'hover:scale-105'
              }`}
            >
              <img
                src={
                  product.product_images && product.product_images.length > 0
                    ? `${baseUrl}/${product.product_images[1]}`
                    : './public/images/default-image.png'
                }
                alt={product.title}
                className={`w-full h-40 object-cover ${
                  product.isStatus ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'
                }`}
                onClick={() => !product.isStatus && navigate(`/product/${product._id}`)}
              />
              <div className="p-4">
                <h4 className="text-lg font-bold capitalize">{truncateTitle(product.title, 25)}</h4>
                <p className="text-gray-900 font-semibold mt-2">€ {product.price}</p>
                <h4 className="text-md font-semibold text-gray-700 mt-2 line-clamp-1">{product.description}</h4>
                <p className="text-gray-500 mt-2 capitalize">{product.category}</p>

                <div className="mt-4 space-y-2">
                  {/* <button
                    onClick={() => handleEditProduct(product._id)}
                    className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
                  >
                    Edit Product
                  </button> */}

                  {product.isStatus && (
                    <>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleContactSupport(product._id, product.title)}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                      >
                        Contact Support
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
