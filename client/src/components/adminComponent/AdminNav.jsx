import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faHome, faTachometerFast, faUser,faListAlt,faWarning, faBell} from '@fortawesome/free-solid-svg-icons';
import ProfileDropdownAdmin from './ProfileDropdownAdmin';
import NotificationPage from './Notifications';
import axios from 'axios';
function NavAdmin() {
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
        const response = await axios.get(`http://localhost:7000/user/${userId}`, {
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
      <div className="hidden md:flex justify-end w-full backdrop-blur-sm py-2 px-8 bg-slate-100 text-black">
        <div className="relative hidden md:flex">
          {/* <i className="absolute left-3 top-1">
            <FontAwesomeIcon icon={faSearch} />
          </i>
          <input
            type="text"
            placeholder="search "
            className="py-1 pl-10 rounded-xl border-1 outline-none border-green-400 focus:bg-slate-200"
          /> */}
          {userName ? (
            <div className="flex items-center ml-4">
              <span className="ml-2 ">{userName}</span>
            </div>)
            : (
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
      </div>
      <div className="flex justify-between w-full backdrop-blur-md py-3 px-8 md:px-32 items-center text-black shadow-sm">
        <a href="">
          <h1 className="hover:scale-105 transition-all font-russo-one text-2xl hover:text-emerald-800">CLYRO</h1>
        </a>
        <ul className="hidden md:flex items-center gap-10 font-semibold text-base">
          <Link to='/alluser'><li className="hover:underline hover:text-emerald-800 cursor-pointer ">users</li></Link>
          <Link to='/admin-home'> <li className="hover:underline hover:text-emerald-800 cursor-pointer">dashboard</li></Link>
          <li className="hover:underline hover:text-emerald-800 cursor-pointer"><NotificationPage/></li>
        </ul>
        <div className="flex items-center justify-center">
          <li className="hidden lg:block list-none m-2 cursor-pointer">
            <ProfileDropdownAdmin />
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
            <FontAwesomeIcon icon={faListAlt} /> users
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faTachometerFast} /> dashboard
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faWarning} /> security
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faBell} /> notification
          </li>
          <li className="list-none w-full text-center p-4 hover:bg-emerald-900 text-white transition-all cursor-pointer">
            <FontAwesomeIcon icon={faUser} /> Login
          </li>

        </div>
      </div>
    </>
  );
}

export default NavAdmin;
