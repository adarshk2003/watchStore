import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProfileDropdownseller() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const toggleDropdown = () => setIsOpen(!isOpen);

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
    <div className="relative inline-block text-left">
      <div onClick={toggleDropdown} className="flex items-center cursor-pointer">
        <FontAwesomeIcon icon={faUser} className="text-lg m-2" />
      </div>

      {isOpen && (
        <div className="absolute -right-32 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
          <div className="px-4 py-2 text-gray-800">
            {userName ? `Hi, ${userName}!` : 'Hi, User!'}
          </div>
          <Link to="/profile" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Profile
          </Link>
          <Link to="/settings" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
            <FontAwesomeIcon icon={faCog} className="mr-2" />
            Settings
          </Link>
          <Link
            to="/logout"
            className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userId');
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdownseller;
