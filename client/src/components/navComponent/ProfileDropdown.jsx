import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCog, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';
import PropTypes from 'prop-types';

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));

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
      .catch((error) => console.error('Error fetching user data:', error));

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
        aria-label="Open account menu"
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-900">Your account</p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-900">{userName || 'Welcome to Clyro'}</p>
          </div>
          {isAuthenticated ? (
            <>
              <MenuLink to="/profile" icon={faUser} onClick={() => setIsOpen(false)}>Profile</MenuLink>
              <MenuLink to="/settings" icon={faCog} onClick={() => setIsOpen(false)}>Settings</MenuLink>
              <MenuLink to="/orders" icon={faBox} onClick={() => setIsOpen(false)}>My orders</MenuLink>
              <button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <MenuLink to="/login" icon={faUser} onClick={() => setIsOpen(false)}>Sign in</MenuLink>
              <MenuLink to="/signup" icon={faUser} onClick={() => setIsOpen(false)}>Create account</MenuLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, onClick, children }) {
  return (
    <Link to={to} role="menuitem" onClick={onClick} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-emerald-950">
      <FontAwesomeIcon icon={icon} className="w-4" /> {children}
    </Link>
  );
}

MenuLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ProfileDropdown;
