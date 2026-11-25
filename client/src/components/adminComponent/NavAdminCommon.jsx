import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChartLine,
  faShieldAlt,
  faSignOutAlt,
  faTimes,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import ProfileDropdownAdmin from './ProfileDropdownAdmin';

const adminLinks = [
  { to: '/admin-home', label: 'Overview', icon: faChartLine, end: true },
  { to: '/alluser', label: 'Users', icon: faUsers },
  { to: '/blockeduser', label: 'Blocked users', icon: faShieldAlt },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-950'
      : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-950'
  }`;

function NavAdminCommon() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fbfaf7]/95 text-stone-900 shadow-sm backdrop-blur-xl">
      <nav aria-label="Administrator navigation" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <Link to="/admin-home" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 font-serif text-lg font-bold text-white transition group-hover:bg-emerald-800">C</span>
          <span className="font-serif text-xl font-bold tracking-[0.18em] text-emerald-950">CLYRO</span>
          <span className="ml-1 hidden rounded-full bg-[#f1eee7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-600 sm:inline">Admin</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {adminLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><ProfileDropdownAdmin /></div>
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-expanded={isMenuOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 md:hidden"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="admin-mobile-menu" className="border-t border-stone-200 bg-[#fbfaf7] px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {adminLinks.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-emerald-50 text-emerald-950' : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
              >
                <FontAwesomeIcon icon={icon} className="w-4" /> {label}
              </NavLink>
            ))}
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              <FontAwesomeIcon icon={faUsers} className="w-4" /> My profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              <span className="w-4" /> Account settings
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavAdminCommon;
