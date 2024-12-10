import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
function Footer() {
    return (
        <footer className="bg-emerald-900 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full md:w-1/4 px-4 mb-4">
                        <h4 className="text-lg font-bold mb-2 font-mono">CLYRO</h4>
                        <ul>
                            <li><a href="#" className="text-gray-300 font-mono hover:text-white">About Us</a></li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/4 px-4 mb-4">
                        <h4 className="text-lg font-bold mb-2 font-mono">Shop</h4>
                        <ul>
                            <li><a href="#" className="text-gray-300 hover:text-white   ">New Arrivals</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Best Sellers</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Sale</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Gift Cards</a></li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/4 px-4 mb-4">
                        <h4 className="text-lg font-bold mb-2">Categories</h4>
                        <ul>
                            <li><a href="#" className="text-gray-300 hover:text-white">Men</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Women</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Kids</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Clyro MAX</a></li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/4 px-4 mb-4">
                        <h4 className="text-lg font-bold mb-2">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-blue-400"> <FaFacebookF /> </a>
                            <a href="#" className="text-gray-300 hover:text-blue-300"> <FaTwitter /> </a>
                            <a href="#" className="text-gray-300 hover:text-pink-300"> <FaInstagram /> </a>
                            <a href="#" className="text-gray-300 hover:text-blue-300"> <FaLinkedinIn /> </a>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center mt-4">
                    <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                        <div className="text-7xl font-bold font-russo-one">CLYRO</div>
                    </div>
                    <div className="w-full md:w-1/2 px-4">
                        <form className="flex">
                            <input type="email" placeholder="Your Email" required className="w-full p-2 bg-transparent border-b rounded-l-md focus:outline-none" />
                            <button type="submit" className=" text-white p-2  bg-transparent rounded-r-md hover:bg-emerald-950">OK</button>
                        </form>
                    </div>
                </div>
                <div className="flex flex-wrap items-center mt-4">
                    <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                        <p>&copy; 2024 CLYRO. All Rights Reserved.</p>
                    </div>
                    <div className="w-full md:w-1/2 px-4 flex justify-end space-x-4">
                        <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
                        <a href="#" className="text-gray-300 hover:text-white">Terms & Conditions</a>
                        <a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
