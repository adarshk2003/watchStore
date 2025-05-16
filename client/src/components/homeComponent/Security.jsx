import React from 'react';
import { motion } from 'framer-motion'; // Import framer-motion

const SecurityContent = () => {
  // Motion variants for the icons and content
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="top-full left-0 w-full bg-white border-slate-950  p-4 flex flex-wrap items-center justify-center"
      style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
      initial="hidden"
      animate="visible"
      variants={contentVariants}
    >
      <div className="text-center w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Product Protection & Buyer Security
        </h3>
        <p className="text-gray-600 mb-4">
          We understand the importance of secure shopping. All your transactions are backed with our full buyer protection policy to ensure a worry-free shopping experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Guaranteed Authenticity Section */}
          <motion.div
            className="bg-green-100 p-4 rounded-md shadow-md w-80 text-center"
            initial="hidden"
            animate="visible"
            variants={iconVariants}
          >
            <div className="text-3xl mb-2">✅</div> {/* Emoji for authenticity */}
            <h4 className="font-semibold text-green-700">Guaranteed Authenticity</h4>
            <p className="text-sm text-green-600">
              We only offer verified products, ensuring 100% authenticity of every item.
            </p>
          </motion.div>

          {/* Buyer Protection Section */}
          <motion.div
            className="bg-blue-100 p-4 rounded-md shadow-md w-80 text-center"
            initial="hidden"
            animate="visible"
            variants={iconVariants}
          >
            <div className="text-3xl mb-2">🛡️</div> {/* Emoji for protection */}
            <h4 className="font-semibold text-blue-700">Buyer Protection</h4>
            <p className="text-sm text-blue-600">
              If there is any issue with your purchase, you’re covered by our easy return and refund policy.
            </p>
          </motion.div>

          {/* Secure Payments Section */}
          <motion.div
            className="bg-yellow-100 p-4 rounded-md shadow-md w-80 text-center"
            initial="hidden"
            animate="visible"
            variants={iconVariants}
          >
            <div className="text-3xl mb-2">💳</div> {/* Emoji for secure payments */}
            <h4 className="font-semibold text-yellow-700">Secure Payments</h4>
            <p className="text-sm text-yellow-600">
              All payments are encrypted and processed securely through trusted providers.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityContent;
