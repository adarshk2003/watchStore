import React, { useState } from "react";
import { FaCookieBite } from "react-icons/fa";

const CookiePolicy = () => {
    const [showPolicy, setShowPolicy] = useState(true);

    const handleAccept = () => {
        localStorage.setItem("clyro-cookie-policy", "accepted");
        setShowPolicy(false);
    };

    return (
        showPolicy && (
            <div className="fixed bottom-8 right-8 bg-gray-800 text-white p-6 rounded-lg shadow-lg w-11/12 md:w-96 z-50">
                <div className="flex items-start gap-4">
                    {/* Cookie Icon */}
                    <FaCookieBite className="text-3xl text-yellow-400" />
                    
                    {/* Text */}
                    <div>
                        <p className="text-sm">
                            <strong>Clyro Watch Shop</strong> uses cookies to improve your experience, analyze traffic, and personalize content. By using our site, you agree to our 
                            <a href="/cookie-policy" className="text-yellow-400 underline ml-1">Cookie Policy</a>.
                        </p>
                        
                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleAccept}
                                className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => setShowPolicy(false)}
                                className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default CookiePolicy;
