import React, { useState } from 'react';
import { FaGlobe } from 'react-icons/fa'; 
import Flag from 'react-world-flags';

const LanguageToggle = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      {/* Globe Icon as Dropdown Button */}
      <button 
        onClick={toggleDropdown} 
        className="text-xl p-2 rounded-full border-2 border-gray-300 hover:bg-gray-200 focus:outline-none"
      >
        <FaGlobe />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          <ul className="py-2">
            {/* English Option */}
            <li 
              onClick={() => { onLanguageChange('en'); setIsOpen(false); }} 
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Flag code="US" className="w-6 h-4 mr-2" />
              English
            </li>
            {/* French Option */}
            <li 
              onClick={() => { onLanguageChange('fr'); setIsOpen(false); }} 
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Flag code="FR" className="w-6 h-4 mr-2" />
              Français
            </li>
            {/* Spanish Option */}
            <li 
              onClick={() => { onLanguageChange('es'); setIsOpen(false); }} 
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Flag code="ES" className="w-6 h-4 mr-2" />
              Español
            </li>
            {/* Japanese Option */}
            <li 
              onClick={() => { onLanguageChange('ja'); setIsOpen(false); }} 
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Flag code="JP" className="w-6 h-4 mr-2" />
              日本語 (Japanese)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
