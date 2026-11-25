import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {
  faBars,
  faBagShopping,
  faHeart,
  faHouse,
  faShop,
  faSignOutAlt,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import ProfileDropdown from './ProfileDropdown';

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-950'
      : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-950'
  }`;

function NavBaruser() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    closeMenu();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fbfaf7]/95 text-stone-900 shadow-sm backdrop-blur-xl">
      <nav aria-label="Customer navigation" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <Link to="/home" className="group flex shrink-0 items-center gap-2" onClick={closeMenu}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 font-serif text-lg font-bold text-white transition group-hover:bg-emerald-800">C</span>
          <span className="font-serif text-xl font-bold tracking-[0.18em] text-emerald-950">CLYRO</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/home" className={navLinkClass}>Home</NavLink>
          <NavLink to="/shop" className={navLinkClass}>Explore watches</NavLink>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-rose-700 sm:inline-flex"
          >
            <FontAwesomeIcon icon={faHeart} />
          </Link>
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-emerald-950"
          >
            <FontAwesomeIcon icon={faBagShopping} />
          </Link>
          <div className="hidden sm:block">
            <ProfileDropdown />
          </div>
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="customer-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 md:hidden"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="customer-mobile-menu" className="border-t border-stone-200 bg-[#fbfaf7] px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            <MobileNavLink to="/home" icon={faHouse} onClick={closeMenu}>Home</MobileNavLink>
            <MobileNavLink to="/shop" icon={faShop} onClick={closeMenu}>Explore watches</MobileNavLink>
            <MobileNavLink to="/wishlist" icon={faHeart} onClick={closeMenu}>Wishlist</MobileNavLink>
            <MobileNavLink to="/cart" icon={faBagShopping} onClick={closeMenu}>Shopping bag</MobileNavLink>
            {localStorage.getItem('authToken') ? (
              <>
                <MobileNavLink to="/profile" icon={faUser} onClick={closeMenu}>My profile</MobileNavLink>
                <MobileNavLink to="/settings" icon={faUser} onClick={closeMenu}>Account settings</MobileNavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { closeMenu(); navigate('/login'); }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
                >
                  <FontAwesomeIcon icon={faUser} className="w-4" /> Sign in
                </button>
                <Link to="/signup" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
                  <span className="w-4" /> Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNavLink({ to, icon, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
          isActive ? 'bg-emerald-50 text-emerald-950' : 'text-stone-700 hover:bg-stone-100'
        }`
      }
    >
      <FontAwesomeIcon icon={icon} className="w-4" />
      {children}
    </NavLink>
  );
}

MobileNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default NavBaruser;
