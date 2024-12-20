import axios from 'axios';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

function AddProduct() {
  const [formData, setFormData] = useState({
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
    waterResestence: "",
    crystal: "",
    brand: "",
    product_images: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          product_images: [...prevData.product_images, reader.result],
        }))
      };
      reader.readAsDataURL(file);
    })
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".webp"],
    },
    multiple: true,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("user not authenticated ,plese login...")
      setLoading(false);
      return;
    }
    try {
      //submit formdata
      const response = await axios.post(
        "http://localhost:7000/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
      );
      console.log(formData);
      if (response.status === 201) {
        setMessage("product added successfully");
        toast.success("product added")
        setFormData({
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
          waterResestence: "",
          crystal: "",
          brand: "",
          product_images: [],

        });
      } else {
        setMessage(response.data.message || "failed to add product.");

      }
      console.log(response);
      console.log(response.data);
    } catch (error) {
      console.error("error adding product", error);
      setMessage("please try again ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes("successfully")
          ? "bg-emerald-900/20 text-green-300"
          : "bg-red-100  text-red-800"
          }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a Category</option>
            <option value="Luxury Watches">Luxury Watches</option>
            <option value="Sport Watches">Sport Watches</option>
            <option value="Diver's Watches">Diver's Watches</option>
            <option value="Pilot/Aviation Watches">Pilot/Aviation Watches</option>
            <option value="Field Watches">Field Watches</option>
            <option value="GMT/World Time Watches">GMT/World Time Watches</option>
            <option value="Chronograph Watches">Chronograph Watches</option>
            <option value="Smart Watches">Smart Watches</option>
            <option value="Fashion Watches">Fashion Watches</option>
          </select>
        </div>


        {/* Brand */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Brand
          </label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a Brand</option>
            <option value="Rolex">Rolex</option>
            <option value="Patek Philippe">Patek Philippe</option>
            <option value="Omega">Omega</option>
            <option value="Cartier">Cartier</option>
            <option value="IWC Schaffhausen">IWC Schaffhausen</option>
            <option value="Titan">Titan</option>
            <option value="Casio">Casio</option>
            <option value="Audemars Piguet">Audemars Piguet</option>
            <option value="TAG Heuer">TAG Heuer</option>
            <option value="Breitling">Breitling</option>
            <option value="Panerai">Panerai</option>
            <option value="Seiko">Seiko</option>
            <option value="Hamilton">Hamilton</option>
            <option value="Tissot">Tissot</option>
            <option value="Longines">Longines</option>
            <option value="Jaeger-LeCoultre">Jaeger-LeCoultre</option>
            <option value="Hublot">Hublot</option>
            <option value="Vacheron Constantin">Vacheron Constantin</option>
            <option value="Breguet">Breguet</option>
            <option value="Bell & Ross">Bell & Ross</option>
            <option value="Montblanc">Montblanc</option>
            <option value="Blancpain">Blancpain</option>
            <option value="Zenith">Zenith</option>
            <option value="Fossil">Fossil</option>
            <option value="Michael Kors">Michael Kors</option>
            <option value="Daniel Wellington">Daniel Wellington</option>

          </select>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* model*/}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/*caseMaterial */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            case material
          </label>
          <input
            type="text"
            id="caseMaterial"
            name="caseMaterial"
            value={formData.caseMaterial}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* dial*/}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            dial
          </label>
          <input
            type="text"
            id="dial"
            name="dial"
            value={formData.dial}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/*bracelet*/}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            bracelet
          </label>
          <input
            type="text"
            id="bracelet"
            name="bracelet"
            value={formData.bracelet}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* movement */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            movement
          </label>
          <input
            type="text"
            id="movement"
            name="movement"
            value={formData.movement}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* power */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            power
          </label>
          <input
            type="text"
            id="power"
            name="power"
            value={formData.power}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* water resestence*/}
        <div className="mb-4">
          <label htmlFor="waterResestence" className="block text-sm font-semibold text-gray-700">
            water Resestence
          </label>
          <input
            type="number"
            id="waterResestence"
            name="waterResestence"
            value={formData.waterResestence}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md "
            required
          />
        </div>
        {/*crystal */}
        <div className="mb-4">
          <label htmlFor="crystal" className="block text-sm font-semibold text-gray-700">
            crystal
          </label>
          <input
            type="text"
            id="crystal"
            name="crystal"
            value={formData.crystal}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>

        {/* Stock */}
        <div className="mb-4">
          <label htmlFor="stock" className="block text-sm font-semibold text-gray-700">
            Stock
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Images */}
        <div className="mb-4">
          <label className="block text-sm font-mono text-gray-700"></label>
          <div
            {...getRootProps()} className='border-2 border-dashed p-6 text-center cursor-pointer'>
            <input {...getInputProps()} />
            <p>click or drag & drop image fies</p>
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            {formData.product_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`preview ${index}`}
                className='w-16 h-16 object-cover'
              />
            ))}
          </div>

        </div>

        {/* Submit Button */}
        <div className="mb-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-900 text-white p-2 rounded-md"
          >
            {loading ? "submitting..." : "Add product "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
