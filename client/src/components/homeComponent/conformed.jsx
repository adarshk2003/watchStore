import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <motion.div
        className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Popping 🎉 */}
        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <span className="text-6xl">🎉</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-3xl font-bold text-green-600 mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Order Confirmed!
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-gray-700 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Thank you for your purchase. Your order is being processed and will be shipped soon.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 shadow-md transform hover:scale-105 transition duration-300"
            onClick={() => navigate("/orders")}
          >
            Go to Orders
          </button>
          <button
            className="bg-gray-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 shadow-md transform hover:scale-105 transition duration-300"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
