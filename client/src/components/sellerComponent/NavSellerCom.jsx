import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faHome, faExplosion, faUser, faShop, faListAlt } from '@fortawesome/free-solid-svg-icons';
import ProfileDropdownseller from './ProfileDropdownseller';
import axios from 'axios';
function NavSellerCom() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      if (!token) {
        console.error('No token found');
        return;
      }
      try {
        const response = await axios.get(`https://watchstore-backends.onrender.com/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data.data[0];
        const { name } = userData;
        setUserName(name);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <>
      <div className="flex justify-between w-full backdrop-blur-md py-3 px-8 md:px-32 items-center text-black shadow-sm">
        <Link to='/seller-home'>
          <h1 className="hover:scale-105 transition-all font-russo-one text-2xl hover:text-emerald-800">CLYRO</h1>
        </Link>
        <ul className="hidden md:flex items-center gap-10 font-semibold text-base">
          <Link to='/seller-home'><li className="hover:underline hover:text-emerald-800 cursor-pointer">home</li></Link>
          <Link to='/myproducts'><li className="hover:underline hover:text-emerald-800 cursor-pointer ">My products</li></Link>
           <Link to='/dashboard-seller'><li className="hover:underline hover:text-emerald-800 cursor-pointer">explore</li></Link>
          <Link to='/addproduct'><li className="hover:underline hover:text-emerald-800 cursor-pointer">Add product</li></Link>
        </ul>
        <div className="flex items-center justify-center">
          {/* <Link to='/wishlist'><li className="list-none m-2 cursor-pointer">
            <FontAwesomeIcon icon={faHeart} />
          </li></Link>
          <Link to='/cart'><li className="list-none m-2 cursor-pointer">
            <FontAwesomeIcon icon={faBagShopping} />
          </li></Link> */}
          <li className="hidden lg:block list-none m-2 cursor-pointer">
            <ProfileDropdownseller />
          </li>
        </div>
        <i className="md:hidden block text-3xl cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FontAwesomeIcon icon={faBars} />
        </i>

        <div className={`absolute md:hidden top-24 left-0 w-full bg-black flex flex-col items-center gap-6 font-semibold text-lg transform transition-transform ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          style={{ zIndex: 50, transition: "transform 0.3s ease, opacity 0.3s ease" }}>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faListAlt} /> My product
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faExplosion} /> Explore
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faShop} />Add product
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faUser} /> Login
          </li>

        </div>
      </div>
    </>
  );
}

export default NavSellerCom;
