import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavSellerCom from './NavSellerCom';
const baseUrl = 'https://watchstore-backends.onrender.com';

function SingleProductSeller() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        console.log(`Fetching product details for product ID: ${id}`);
        const response = await axios.get(`${baseUrl}/product/${id}`);
        setProduct(response.data);
        if (response.data.product_images?.length > 0) {
          setMainImage(response.data.product_images[0]);
        }
        fetchSimilarProducts(response.data.category);
      } catch (err) {
        console.error('Product fetch error:', err);
        setError('Failed to load product details.');
      }
    };

    fetchProductDetails();
  }, [id]);

  const fetchSimilarProducts = async (category) => {
    try {
      console.log(`Fetching similar products for category: ${category}`);
      const response = await axios.get(`${baseUrl}/products/category/${category}`);
      const filteredProducts = response.data.data.filter((product) => !product.isStatus);
      setSimilarProducts(filteredProducts || []);
    } catch (err) {
      console.error('Error fetching similar products:', err);
    }
  };

  if (!product) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (<>
  <NavSellerCom/>
    <div className="flex flex-col gap-8 p-6">
      {/* Product Images and Features */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images */}
        <div className="flex flex-col w-full lg:w-1/2 gap-4">
          <img
            src={`${baseUrl}/${mainImage}`}
            alt={product.title}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
          <div className="flex gap-2">
            {product.product_images?.map((img, index) => (
              <img
                key={index}
                src={`${baseUrl}/${img}`}
                alt={`Product ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md cursor-pointer border"
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Features and Actions */}
        <div className="flex flex-col w-full lg:w-1/2 gap-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <h2 className="text-lg text-gray-600">Brand: {product.brand}</h2>
          <p>{product.description}</p>
          <h3 className="text-2xl font-semibold text-green-700">₹{product.price}</h3>

          {/* Product Features */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Product Features</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Model:</strong> {product.model}</li>
              <li><strong>Case Material:</strong> {product.caseMaterial}</li>
              <li><strong>Dial:</strong> {product.dial}</li>
              <li><strong>Bracelet:</strong> {product.bracelet}</li>
              <li><strong>Movement:</strong> {product.movement}</li>
              <li><strong>Power Reserve:</strong> {product.power} hours</li>
              <li><strong>Water Resistance:</strong> {product.waterResestence} meters</li>
              {product.crystal && <li><strong>Crystal:</strong> {product.crystal}</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div>
        <h2 className="text-2xl font-bold">Similar Products</h2>
        <div className="flex flex-wrap gap-4">
          {similarProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/products/${product._id}`)}
              className="p-4 border rounded-lg cursor-pointer"
            >
              <img
                src={`${baseUrl}/${product.product_images[0]}`}
                alt={product.title}
                className="w-60 h-32 object-cover"
              />
            <h3>
  {product.title.length > 30 ? `${product.title.substring(0, 30)}...` : product.title}
</h3>

              <p>₹{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
 </> );
}

export default SingleProductSeller;
