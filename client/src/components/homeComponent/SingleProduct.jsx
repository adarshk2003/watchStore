import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addToCart } from './cartUtil';
import { FaShoppingCart, FaHeart, FaRegHeart, FaBolt } from 'react-icons/fa';

const baseUrl = 'http://localhost:7000';

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [error, setError] = useState(null);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

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

        // Check if product is already in cart or wishlist
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        setInCart(cartItems.includes(response.data._id));
        setInWishlist(wishlistItems.includes(response.data._id));
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
      const filteredProducts = response.data.data.filter(product => !product.isStatus);
      setSimilarProducts(filteredProducts || []);
    } catch (err) {
      console.error('Error fetching similar products:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Product not found!');
      return;
    }

    if (inCart) {
      toast.info('Product already in cart!');
      return; // Prevent duplicate request
    }

    const { success, error } = await addToCart(product._id);

    if (success) {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      localStorage.setItem('cartItems', JSON.stringify([...cartItems, product._id]));
      setInCart(true);
      toast.success('Product added to cart!');
    } else {
      console.error('Add to cart failed:', error);
      toast.error(error?.message || 'Failed to add product to cart.');
    }
  };

  const handleAddToWishlist = () => {
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];

    if (inWishlist) {
      const updatedWishlist = wishlistItems.filter(item => item !== product._id);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setInWishlist(false);
      toast.success('Removed from Wishlist!');
    } else {
      localStorage.setItem('wishlistItems', JSON.stringify([...wishlistItems, product._id]));
      setInWishlist(true);
      toast.success('Added to Wishlist!');
    }
  };

  if (!product) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
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
          <h3 className="text-2xl font-semibold text-green-700">€{product.price}</h3>

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

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 rounded-lg text-emerald-900 border border-emerald-900 bg-transparent flex items-center gap-2"
              disabled={product.stock <= 0}
            >
              {inCart ? <FaShoppingCart /> : <FaRegHeart />} Add to Cart
            </button>

            <button
              onClick={() => navigate(`/checkout/${product._id}`)}
              className="px-6 py-3 rounded-lg text-emerald-900 border border-emerald-900 bg-transparent flex items-center gap-2"
            >
              <FaBolt /> Buy Now
            </button>

            <button
              onClick={handleAddToWishlist}
              className="px-6 py-3 rounded-lg text-emerald-900 border border-emerald-900 bg-transparent flex items-center gap-2"
            >
              {inWishlist ? <FaHeart /> : <FaRegHeart />} Wishlist
            </button>
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
              onClick={() => navigate(`/product/${product._id}`)}
              className="p-4 border rounded-lg cursor-pointer"
            >
              <img
                src={`${baseUrl}/${product.product_images[0]}`}
                alt={product.title}
                className="w-32 h-32 object-cover"
              />
              <h3>{product.title}</h3>
              <p>€{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
