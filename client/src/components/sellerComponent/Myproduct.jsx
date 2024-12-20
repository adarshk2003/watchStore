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

  // Fetch products
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

            console.log('Fetched response:', response.data);
            const allProducts = response.data.data;

            // Log each product to inspect its structure
            allProducts.forEach((product) => {
                console.log('Full product details:', product);
                console.log('Checking user reference in product:', product.userId || product.seller || product.createdBy || product.user);
            });

            const userOwnedProducts = allProducts.filter((product) => {
                console.log('Checking user reference in product:', product.userId || product.seller || product.createdBy || product.user);
                return (product.userId && product.userId._id === userId) || 
                       (product.seller && product.seller._id === userId) || 
                       (product.createdBy && product.createdBy._id === userId);
            });

            setUserProducts(userOwnedProducts);
            setProducts(allProducts);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Something went wrong");
            setLoading(false);
        }
    };

    fetchProducts();
  }, [token, userId]);

  // Function to truncate the title to a maximum length with ellipsis
  const truncateTitle = (title, maxLength = 29) => {
    if (title.length > maxLength) {
      return title.slice(0, maxLength) + '...';
    }
    return title;
  };

  return (
    <>
      <div className="container-fluid w-full">
        <div className="container mx-auto my-8 px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">My Products</h3>
          
          {/* Loading State */}
          {loading && <p className="text-gray-500">Loading products...</p>}
          
          {/* Error State */}
          {error && <p className="text-red-500">{error}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.isArray(userProducts) && userProducts.map((product) => (
              <div key={product._id} className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                <img
                  src={
                    product.product_images && product.product_images.length > 0
                      ? `${baseUrl}/${product.product_images[1]}`
                      : './public/images/default-image.png' // Fallback to a default image
                  }
                  alt={product.title}
                  className="w-full h-40 object-cover hover:cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                />
                <div className="p-4">
                  <h4 className="text-lg font-bold capitalize">{truncateTitle(product.title, 25)}</h4> {/* Truncate title to 25 characters */}
                  <p className="text-gray-900 font-semibold mt-2">€ {product.price}</p>
                  <h4 className="text-md font-semibold text-gray-700 mt-2 line-clamp-1">{product.description}</h4>
                  <p className="text-gray-500 mt-2 capitalize">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
