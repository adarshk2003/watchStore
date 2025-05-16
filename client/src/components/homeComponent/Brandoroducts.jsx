import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import NavBaruser from "../navComponent/userNav";

const BrandProducts = () => {
  const { brandName } = useParams(); // Access the brand name from the URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate=useNavigate()

  useEffect(() => {
    // Fetch products from the /products endpoint
    const token = localStorage.getItem('authToken'); // Get token from localStorage
    axios
      .get('http://localhost:7000/products', {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the header
        },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        // Assuming the response is like { success: true, statusCode: 200, data: [...] }
        if (response.data.success) {
          const brandProducts = response.data.data.filter(
            (product) => product.brand.toLowerCase() === brandName.toLowerCase()
          );
          setProducts(brandProducts);
        } else {
          setError("Failed to fetch products.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      });
  }, [brandName]);

  const handleProductCardClick = (productId) => {
    navigate(`/product/${productId}`, { replace: false });
  };
  // Handle loading, error, or empty products
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (products.length === 0) return <div>No products found for this brand.</div>;

  return (
    <>
    <NavBaruser/>
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{brandName} Products</h2>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => {
          const imageUrl =
            product.product_images && product.product_images.length > 0
              ? `http://localhost:7000/${product.product_images[0]}`
              : 'https://via.placeholder.com/150';

          return (
            <div key={product._id} className="p-4 border rounded-md">
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-auto object-cover rounded-md cursor-pointer"
            onClick={() => handleProductCardClick(product._id)}
              />
              <p className="mt-2">{product.title}</p>
              <p className="text-gray-600">{product.price}</p>
            </div>
          );
        })}
      </div>
    </div>
 </> );
};

export default BrandProducts;
