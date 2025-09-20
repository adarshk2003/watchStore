import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';

function NavBaruser() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate=useNavigate();
    const handleBack = () => {
      navigate(-1); 
    };
  return (
    <>
      <div className="flex justify-between w-full backdrop-blur-md py-3 px-8 md:px-32 items-center text-black shadow-sm">
        <Link to='/home'>
          <h1 className="hover:scale-105 transition-all font-russo-one text-2xl hover:text-emerald-800">
            CLYRO
          </h1>
        </Link>
        <ul className="hidden md:flex items-center gap-10 font-semibold text-base">
        <Link to='/home'>  <li className="hover:underline hover:text-emerald-800 cursor-pointer">Home</li></Link>
          <Link to='/shop'><li className="hover:underline hover:text-emerald-800 cursor-pointer">Explore</li></Link>
          <Link><li onClick={handleBack} className="hover:underline hover:text-emerald-800 cursor-pointer">Back</li></Link>
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
  <Link to="/home">
    <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
      <FontAwesomeIcon icon={faHome} /> Home
    </li>
  </Link>

  <Link to="/category">
    <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
      <FontAwesomeIcon icon={faListAlt} /> Category
    </li>
  </Link>

  <Link to="/explore">
    <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
      <FontAwesomeIcon icon={faExplosion} /> Explore
    </li>
  </Link>

  <Link to="/shop">
    <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
      <FontAwesomeIcon icon={faShop} /> Shop
    </li>
  </Link>
  <Link to="/login">
    <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
      <FontAwesomeIcon icon={faUser} /> Login
    </li>
  </Link>
</div>

      </div>
    </>
  );
}


export default NavBaruser;
