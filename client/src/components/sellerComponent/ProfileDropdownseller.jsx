import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCog, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';

function ProfileDropdownseller() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return undefined;

    let active = true;
    axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `bearer ${token}` },
    })
      .then((response) => {
        if (active) setUserName(response.data?.data?.[0]?.name || '');
      })
      .catch((error) => console.error('Error fetching seller data:', error));

    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open seller account menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-stone-700 shadow-sm transition hover:border-emerald-800 hover:text-emerald-950"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-xs font-semibold text-white">
          {userName ? userName.trim().charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
        </span>
        <span className="max-w-24 truncate">{userName || 'Account'}</span>
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white py-2 shadow-xl">
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-900">Seller account</p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-900">{userName || 'Welcome to Clyro'}</p>
          </div>
          <Link to="/profile" role="menuitem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-emerald-950">
            <FontAwesomeIcon icon={faUser} className="w-4" /> Profile
          </Link>
          <Link to="/settings" role="menuitem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-emerald-950">
            <FontAwesomeIcon icon={faCog} className="w-4" /> Settings
          </Link>
          <Link to="/myproducts" role="menuitem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-emerald-950">
            <FontAwesomeIcon icon={faBox} className="w-4" /> My products
          </Link>
          <button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdownseller;
