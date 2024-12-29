import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const WarningBlocked = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-red-600 text-white px-4">
            <div className="flex flex-col items-center max-w-lg text-center">
                {/* Icon */}
                <FaExclamationTriangle className="text-6xl mb-6" />
                
                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">
                    Your Account Has Been Blocked by the Admin
                </h1>
                
                {/* Message */}
                <p className="mb-6 text-lg">
                    Your access has been restricted. Please contact support or the admin 
                    to resolve this issue. The reasons for the block may include suspicious 
                    activities or a violation of our policies.
                </p>
                
                {/* Options */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        className="bg-white text-red-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                        onClick={() => window.location.href = "/contact-support"}
                    >
                        Contact Support
                    </button>
                    <button
                        className="bg-white text-red-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningBlocked;
