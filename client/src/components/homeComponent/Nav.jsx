import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBagShopping,
  faBars,
  faHeart,
  faHouse,
  faMagnifyingGlass,
  faSignOutAlt,
  faShop,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import ProfileDropdown from '../navComponent/ProfileDropdown';

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-950'
      : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-950'
  }`;

function NavBar({ onProductSelect }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const query = searchQuery.trim();
    let active = true;
    if (!query) {
      setProducts([]);
      setSearchError('');
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, {
          params: { page: 1, limit: 6, availableOnly: true, q: query },
        });
        if (active && Array.isArray(response.data?.data)) {
          setProducts(response.data.data);
          setSearchError('');
        }
      } catch (error) {
        console.error('Error loading products for search:', error);
        if (active) setSearchError('Search is temporarily unavailable.');
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter((product) => (
        !product.isStatus &&
        (
          product.title?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
        )
      ))
      .slice(0, 6);
  }, [products, searchQuery]);

  const openProduct = (product) => {
    onProductSelect?.(product);
    setSearchQuery('');
    setIsMenuOpen(false);
    navigate(`/product/${product._id}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (filteredProducts[0]) openProduct(filteredProducts[0]);
    else if (searchQuery.trim()) navigate('/shop');
  };

  const mobileLinks = [
    { to: '/home', label: 'Home', icon: faHouse },
    { to: '/shop', label: 'Explore watches', icon: faShop },
    { to: '/wishlist', label: 'Wishlist', icon: faHeart },
    { to: '/cart', label: 'Shopping bag', icon: faBagShopping },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fbfaf7]/95 text-stone-900 shadow-sm backdrop-blur-xl">
      <nav aria-label="Customer navigation" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <Link to="/home" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 font-serif text-lg font-bold text-white transition group-hover:bg-emerald-800">C</span>
          <span className="font-serif text-xl font-bold tracking-[0.18em] text-emerald-950">CLYRO</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/home" className={linkClass}>Home</NavLink>
          <NavLink to="/shop" className={linkClass}>Explore</NavLink>
          <Link to="/support" className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-emerald-950">Support</Link>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center px-4 lg:flex">
          <div className="relative w-full max-w-sm">
            <form onSubmit={submitSearch} role="search">
              <label htmlFor="store-search" className="sr-only">Search watches</label>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400" />
              <input
                id="store-search"
                type="search"
                autoComplete="off"
                placeholder="Search watches"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
              />
            </form>
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                {searchError ? (
                  <p className="px-4 py-4 text-sm text-rose-700" role="status">{searchError}</p>
                ) : filteredProducts.length ? (
                  <ul>
                    {filteredProducts.map((product) => (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => openProduct(product)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f7f6f2]"
                        >
                          <img
                            src={product.product_images?.[0] || '/Omega.jpeg'}
                            alt=""
                            className="h-12 w-12 rounded-lg bg-[#f1eee7] object-contain p-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-stone-900">{product.title}</span>
                            <span className="mt-1 block text-xs text-stone-500">{product.brand} · ₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-stone-100">
                      <Link to="/shop" onClick={() => setSearchQuery('')} className="block px-4 py-3 text-center text-xs font-semibold text-emerald-900 hover:bg-emerald-50">
                        See the full collection
                      </Link>
                    </li>
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-sm text-stone-500" role="status">No matching watches. Press Enter to browse the collection.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-rose-700 sm:inline-flex">
            <FontAwesomeIcon icon={faHeart} />
          </Link>
          <Link to="/cart" aria-label="Shopping bag" className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-emerald-950">
            <FontAwesomeIcon icon={faBagShopping} />
          </Link>
          <div className="hidden sm:block"><ProfileDropdown /></div>
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="home-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 md:hidden"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="home-mobile-menu" className="border-t border-stone-200 bg-[#fbfaf7] px-4 pb-5 pt-3 shadow-lg md:hidden">
          <form onSubmit={submitSearch} role="search" className="relative mx-auto mb-3 max-w-7xl">
            <label htmlFor="store-search-mobile" className="sr-only">Search watches</label>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400" />
            <input
              id="store-search-mobile"
              type="search"
              placeholder="Search watches"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </form>
          <div className="mx-auto grid max-w-7xl gap-1">
            {mobileLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
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
            {localStorage.getItem('authToken') ? (
              <>
                <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100">
                  <FontAwesomeIcon icon={faUser} className="w-4" /> My profile
                </NavLink>
                <NavLink to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100">
                  <span className="w-4" /> Account settings
                </NavLink>
                <button type="button" onClick={logout} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-50">
                  <FontAwesomeIcon icon={faUser} className="w-4" /> Sign in
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100">
                  <span className="w-4" /> Create account
                </Link>
              </>
            )}
            {searchQuery.trim() && (
              <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white">
                {searchError ? (
                  <p className="p-3 text-sm text-rose-700">{searchError}</p>
                ) : filteredProducts.length ? filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product._id}
                    onClick={() => openProduct(product)}
                    className="flex w-full items-center gap-3 border-b border-stone-100 p-3 text-left last:border-0"
                  >
                    <img src={product.product_images?.[0] || '/Omega.jpeg'} alt="" className="h-10 w-10 rounded-lg bg-[#f1eee7] object-contain p-1" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{product.title}</span>
                      <span className="text-xs text-stone-500">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                    </span>
                  </button>
                )) : <p className="p-3 text-sm text-stone-500">No matching watches found.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

NavBar.propTypes = {
  onProductSelect: PropTypes.func,
};

export default NavBar;
