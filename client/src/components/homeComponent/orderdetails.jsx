import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NavBaruser from "../navComponent/userNav";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate(); // Added navigate
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default values for cartItems and total
  const { cartItems = [], total = "0" } = state || {};
  const orderTotal = parseFloat(total); // Convert total to a number

  useEffect(() => {
    if (isNaN(orderTotal)) {
      console.error("Total is not a valid number:", total);
      setError("Invalid total amount. Please try again.");
    }
  }, [orderTotal]);

  const handlePlaceOrder = async () => {
    if (!address) {
      setError("Address is required.");
      return;
    }
    setLoading(true);
    setError(""); // Clear previous error

    const token = localStorage.getItem("authToken");

    try {
      const orderData = {
        products: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        address,
        total: orderTotal, // Use numeric total
        paymentMethod,
      };

      const response = await axios.post(
        "http://localhost:7000/createOrder",
        orderData,
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Order Placed.");
        navigate('/conformed'); // Navigate to the confirmation page
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBaruser />
      <div className="flex flex-col lg:flex-row lg:justify-between items-start min-h-screen bg-white p-4 lg:p-8">
        {/* Delivery Details */}
        <div className="bg-white w-full lg:w-1/2 rounded-lg p-6 mb-8 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Details</h2>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
              Shipping Address <br />
              <span className="text-sm">Select or enter your shipping address</span>
            </label>
            {/* <select
              id="address"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            >
              <option value="">Select an Address</option>
              {savedAddresses.map((addr, index) => (
                <option key={index} value={addr}>
                  {addr}
                </option>
              ))}
            </select> */}
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your shipping address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="paymentMethod">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash On Delivery</option>
            </select>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow-md mt-4 rounded-lg p-6 w-full lg:w-1/3">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>

          <div className="text-gray-700 text-lg mb-4">
            <p>
              Total Items: <span className="font-bold">{cartItems.length}</span>
            </p>
            <p>
              Bag Total: <span className="font-bold">₹{orderTotal.toFixed(2)}</span>
            </p>
            <p>
              Convenience Fee: <span className="font-bold">₹19.00</span>
            </p>
            <p>
              Delivery Fee: <span className="font-bold">Free</span>
            </p>
            <p>
              Platform Fee: <span className="font-bold">₹29.00</span>
            </p>
            <p className="font-bold text-green-600">
              Order Total: ₹{(orderTotal + 19 + 29).toFixed(2)}
            </p>
          </div>

          <button
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-800"
            }`}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </>
  );
}
