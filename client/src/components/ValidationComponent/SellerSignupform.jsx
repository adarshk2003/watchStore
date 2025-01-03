import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import axios from 'axios';

function SellerSignUpForm() {
  const { userId } = useParams(); 
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    phoneNumber: '', 
    businessName: '', 
    businessType: '', 
    businessAddress: '', 
    businessRegistrationNumber: '', 
    website: '', 
    shippingMethods: '', 
    returnPolicy: '', 
    shippingLocations: '', 
    sellerBio: '', 
    logo: null, 
  }); 

  useEffect(() => {
    // Fetch user data to pre-fill form 
    const fetchUserData = async () => {
      try { 
        const response = await axios.get(`http://localhost:7000/seller/${userId}`); 
        setFormData((prevState) => ({ 
          ...prevState, 
          fullName: response.data.name, 
          email: response.data.email 
        }));
      } catch (error) {
        console.error('Error fetching user data:', error); 
      } 
    }; 
    fetchUserData(); 
  }, [userId]);

  const handleChange = (e) => { 
    const { name, value, files } = e.target; 
    if (name === 'logo') { 
      setFormData({ ...formData, [name]: files[0] });
    } else { 
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    try { 
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => { 
        formDataToSend.append(key, formData[key]); 
      }); 
      await axios.post(`http://localhost:7000/seller/${userId}`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      }); 
      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Error creating seller profile:', error); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-emerald-900">Seller Sign-Up</h2>

      {/* Personal Information */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Business Information */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Business Name</label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Business Type</label>
        <input
          type="text"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Business Address</label>
        <input
          type="text"
          name="businessAddress"
          value={formData.businessAddress}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Business Registration Number</label>
        <input
          type="text"
          name="businessRegistrationNumber"
          value={formData.businessRegistrationNumber}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Website (optional)</label>
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Shipping and Logistics */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Shipping Methods</label>
        <input
          type="text"
          name="shippingMethods"
          value={formData.shippingMethods}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Return Policy</label>
        <input
          type="text"
          name="returnPolicy"
          value={formData.returnPolicy}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Shipping Locations</label>
        <input
          type="text"
          name="shippingLocations"
          value={formData.shippingLocations}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Additional Information */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Seller Bio</label>
        <textarea
          name="sellerBio"
          value={formData.sellerBio}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Logo Upload</label>
        <input
          type="file"
          name="logo"
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="w-full flex flex-col my-5">
        <button type="submit" className="my-2 w-full bg-slate-900 text-white rounded-md p-4 font-mono text-center hover:bg-emerald-900">
          Create Seller Account
        </button>
      </div>
    </form>
  );
}

export default SellerSignUpForm;
