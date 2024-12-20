import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addToCart } from './cartUtil';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    model: "",
    caseMaterial: "",
    dial: "",
    bracelet: "",
    movement: "",
    power: "",
    waterResistance: "",
    crystal: "",
    brand: "",
    product_images: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/product/${id}`);
        const fetchedProduct = response.data;
        setProduct(fetchedProduct);
        if (fetchedProduct.product_images && fetchedProduct.product_images.length > 0) {
          setMainImage(fetchedProduct.product_images[0]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-16 lg:items-start p-6">
      {/* Left Section: Images */}
      <div className="flex flex-col lg:w-1/2 gap-4">
        <img
          src={`http://localhost:7000/${mainImage}`}
          alt={product.title}
          className="w-full h-auto object-cover rounded-lg shadow-lg"
        />
        <div className="flex flex-row gap-4">
          {product.product_images.map((img, index) => (
            <img
              key={index}
              src={`http://localhost:7000/${img}`}
              alt={`Product ${index + 1}`}
              className="w-24 h-24 object-cover rounded-md cursor-pointer border"
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Right Section: Details */}
      <div className="flex flex-col lg:w-1/2 gap-6">
        <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
        <h2 className="text-lg text-gray-600">Brand: {product.brand}</h2>
        <p className="text-gray-700">{product.description}</p>

        <ul className="text-sm text-gray-700">
          <li><strong>Category:</strong> {product.category}</li>
          <li><strong>Model:</strong> {product.model}</li>
          <li><strong>Case Material:</strong> {product.caseMaterial}</li>
          <li><strong>Dial:</strong> {product.dial}</li>
          <li><strong>Bracelet:</strong> {product.bracelet}</li>
          <li><strong>Movement:</strong> {product.movement}</li>
          <li><strong>Power Reserve:</strong> {product.power}</li>
          <li><strong>Water Resistance:</strong> {product.waterResistance}</li>
          <li><strong>Crystal:</strong> {product.crystal}</li>
        </ul>

        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-semibold text-emerald-800">€{product.price}</h3>
          <button
            onClick={() => {
              if (product.stock > 0) {
                addToCart(product.id);
                toast.success("Added to cart");
              } else {
                toast.error("Out of stock");
              }
            }}
            className={`px-6 py-3 rounded-lg text-white font-bold ${
              product.stock > 0 ? "bg-emerald-900 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        <p className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
          {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
        </p>
      </div>
    </div>
  );
}

export default ProductPage;
