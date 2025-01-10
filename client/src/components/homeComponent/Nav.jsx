import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBars,
  faBagShopping,
  faHeart,
  faHome,
  faExplosion,
  faUser,
  faShop,
  faListAlt,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import ProfileDropdown from '../navComponent/ProfileDropdown';

function NavBar({ onProductSelect }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchContentVisible, setIsSearchContentVisible] = useState(false);
  const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      if (!token) {
        console.warn('No token found');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:7000/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data.data[0];
        setUserName(userData.name);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:7000/products');
        if (response.data?.data) {
          setProducts(response.data.data);
          const uniqueCategories = [
            ...new Set(response.data.data.map((product) => product.category)),
          ];
          const uniqueBrands = [
            ...new Set(response.data.data.map((product) => product.brand)),
          ];
          setCategories(uniqueCategories);
          setBrands(uniqueBrands);
        } else {
          console.warn('No products found in response:', response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Filter out blocked products
      const results = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) && !product.isStatus
      );
      setFilteredProducts(results);
      setIsSearchContentVisible(results.length > 0);
    } else {
      setFilteredProducts([]);
      setIsSearchContentVisible(false);
    }
  }, [searchQuery, products]);
  

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const closeSearchContent = () => {
    setSearchQuery('');
    setIsSearchContentVisible(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="hidden md:flex justify-end w-full backdrop-blur-sm py-2 px-8 bg-slate-100 text-black">
        <div className="relative hidden md:flex flex-col w-full max-w-md">
          <form>
            <i className="absolute left-3 top-1">
              <FontAwesomeIcon icon={faSearch} />
            </i>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="py-1 pl-10 w-full rounded-xl border outline-none border-green-400 focus:bg-slate-200"
            />
          </form>
        </div>
        {userName ? (
          <div className="flex items-center ml-4">
            <span className="ml-2">{userName}</span>
          </div>
        ) : (
          <>
            <li className="list-none px-2 py-1 cursor-pointer hover:underline text-sm">
              <Link to="/login">Login</Link>
            </li>
            <li className="list-none py-1 cursor-pointer hover:underline text-sm">
              <Link to="/signup">Signup</Link>
            </li>
          </>
        )}
      </div>

      {/* Main Navigation Bar */}
      <div className="flex justify-between w-full backdrop-blur-md py-3 px-8 md:px-32 items-center text-black shadow-sm">
        <a href="/">
          <h1 className="hover:scale-105 transition-all font-russo-one text-2xl hover:text-emerald-800">
            CLYRO
          </h1>
        </a>
        <ul className="hidden md:flex items-center gap-10 font-semibold text-base">
          <li className="hover:underline hover:text-emerald-800 cursor-pointer">Home</li>
          <li
            className="relative hover:underline hover:text-emerald-800 cursor-pointer"
            onMouseEnter={() => setIsMegaMenuVisible(true)}
            onMouseLeave={() => setIsMegaMenuVisible(false)}
          >
            Category
            {isMegaMenuVisible && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg p-4 flex flex-wrap">
                <div className="w-1/2 md:w-1/3 lg:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Categories</h3>
                  <ul>
                    {categories.map((category, index) => (
                      <li key={index} className="py-1 hover:text-emerald-800">
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-1/2 md:w-1/3 lg:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Brands</h3>
                  <ul>
                    {brands.map((brand, index) => (
                      <li key={index} className="py-1 hover:text-emerald-800">
                        {brand}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>
          <li className="hover:underline hover:text-emerald-800 cursor-pointer">Explore</li>
          <li className="hover:underline hover:text-emerald-800 cursor-pointer">Shop</li>
        </ul>
        <div className="flex items-center justify-center">
          <Link to="/wishlist">
            <li className="list-none m-2 cursor-pointer">
              <FontAwesomeIcon icon={faHeart} />
            </li>
          </Link>
          <Link to="/cart">
            <li className="list-none m-2 cursor-pointer">
              <FontAwesomeIcon icon={faBagShopping} />
            </li>
          </Link>
          <li className="hidden lg:block list-none m-2 cursor-pointer">
            <ProfileDropdown />
          </li>
        </div>
        <i
          className="md:hidden block text-3xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
        </i>
        <div
          className={`absolute md:hidden top-24 left-0 w-full bg-black flex flex-col items-center gap-6 font-semibold text-lg transform transition-transform ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 50, transition: 'transform 0.3s ease, opacity 0.3s ease' }}
        >
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faListAlt} /> Category
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faExplosion} /> Explore
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faShop} /> Shop
          </li>
          {userName ? (
            <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
              <FontAwesomeIcon icon={faSignOutAlt} /> {userName}
            </li>
          ) : (
            <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
              <FontAwesomeIcon icon={faUser} /> Login
            </li>
          )}
        </div>
      </div>

      {/* Floating Search Content */}
      {isSearchContentVisible && (
        <div
          className="fixed top-16 left-0 w-auto bg-white z-50 shadow-lg p-4 max-h-80"
          style={{ transition: 'opacity 0.3s ease' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <button
              onClick={closeSearchContent}
              className="text-red-600 font-bold text-sm"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="product-card cursor-pointer"
                  onClick={() => {
                    onProductSelect(product); // Notify parent about selected product
                    closeSearchContent();
                  }}
                >
                  <img
                    src={`http://localhost:7000/${product.product_images?.[0] || 'placeholder.jpg'}`}
                    alt={product.title || 'Product'}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <div className="p-2">
                    <h3 className="text-lg font-semibold truncate">{product.title}</h3>
                    <p className="text-gray-600 mt-1">${product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No products found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;
