import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaHeart, FaShoppingBag } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from './cartUtil';
import { addToWishlist, removeFromWishlist } from './wishlistUtil';

const productsPerPage = 8;
const fallbackImage = '/rolex.jpg';

const priceRanges = [
  { value: '', label: 'Any price' },
  { value: 'under-10000', label: 'Under ₹10,000' },
  { value: '10000-50000', label: '₹10,000 – ₹50,000' },
  { value: '50000-200000', label: '₹50,000 – ₹2,00,000' },
  { value: 'above-200000', label: 'Above ₹2,00,000' },
];

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;
    const params = {
      page: currentPage,
      limit: productsPerPage,
      availableOnly: true,
      includeFacets: true,
      brand: selectedBrand || undefined,
      category: selectedCategory || undefined,
    };
    if (selectedPriceRange === 'under-10000') params.maxPrice = 9999.99;
    if (selectedPriceRange === '10000-50000') {
      params.minPrice = 10000;
      params.maxPrice = 49999.99;
    }
    if (selectedPriceRange === '50000-200000') {
      params.minPrice = 50000;
      params.maxPrice = 200000;
    }
    if (selectedPriceRange === 'above-200000') params.minPrice = 200000.01;

    const fetchCollection = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, { params });
        const pageProducts = response.data?.data;
        const pagination = response.data?.pagination;
        if (!Array.isArray(pageProducts) || !pagination) {
          throw new Error('The watch collection response was not in the expected format.');
        }
        if (active) {
          setProducts(pageProducts);
          setTotalItems(pagination.totalItems);
          setTotalPages(pagination.totalPages);
          if (response.data.facets) {
            setBrands(response.data.facets.brands || []);
            setCategories(response.data.facets.categories || []);
          }
          if (currentPage === 1) {
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            setNewArrivals(pageProducts.filter((product) => {
              const createdAt = new Date(product.createdAt).getTime();
              return Number.isFinite(createdAt) && createdAt >= oneWeekAgo;
            }).slice(0, 4));
          }
        }
      } catch (requestError) {
        console.error('Could not load the watch collection:', requestError);
        if (active) setError(requestError.response?.data?.message || 'We could not load the collection. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCollection();
    return () => {
      active = false;
    };
  }, [currentPage, selectedPriceRange, selectedBrand, selectedCategory]);

  useEffect(() => {
    let active = true;
    const loadShoppingState = async () => {
      if (!token) {
        try {
          const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
          if (active && Array.isArray(localCart)) setCartItems(localCart);
        } catch (storageError) {
          console.error('Could not read the saved cart:', storageError);
        }
        return;
      }

      const [cartResult, wishlistResult] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/viewCart`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/viewWishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!active) return;

      if (cartResult.status === 'fulfilled') {
        const items = cartResult.value.data?.items;
        setCartItems(Array.isArray(items)
          ? items.map((item) => item?.productId?._id || item?.productId).filter(Boolean)
          : []);
      } else {
        console.error('Could not load cart status on the home page:', cartResult.reason);
      }
      if (wishlistResult.status === 'fulfilled') {
        const items = wishlistResult.value.data?.items;
        setWishlistItems(Array.isArray(items)
          ? items.map((item) => item?.productId?._id || item?.productId).filter(Boolean)
          : []);
      } else {
        console.error('Could not load wishlist status on the home page:', wishlistResult.reason);
      }
    };

    loadShoppingState();
    return () => {
      active = false;
    };
  }, [token]);

  const filteredProducts = products;
  const currentProducts = products;

  const resetPage = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (cartItems.includes(productId)) return;

    const result = await addToCart(productId);
    if (result?.success) {
      setCartItems((current) => current.includes(productId) ? current : [...current, productId]);
    }
  };

  const handleToggleWishlist = (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (wishlistItems.includes(productId)) {
      removeFromWishlist(productId, token, setWishlistItems);
    } else {
      addToWishlist(productId, token, setWishlistItems);
    }
  };

  const clearFilters = () => {
    setSelectedPriceRange('');
    setSelectedBrand('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  return (
    <section className="bg-[#fbfaf7] px-4 py-12 sm:px-8 sm:py-16" aria-labelledby="collection-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Find your next favourite</p>
            <h2 id="collection-title" className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Explore the collection
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
              Browse by brand, style, or price and find a watch that feels right for you.
            </p>
          </div>
          <Link to="/shop" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-950 transition hover:text-emerald-700">
            Open full shop <FaArrowRight aria-hidden="true" size={12} />
          </Link>
        </div>

        {newArrivals.length > 0 && !loading && !error && (
          <div className="mt-9">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">Just added</p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-stone-950">New arrivals</h3>
              </div>
              <Link to="/shop" className="text-xs font-semibold text-emerald-900 hover:text-emerald-700">See all</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard
                  key={`arrival-${product._id}`}
                  product={product}
                  cartItems={cartItems}
                  wishlistItems={wishlistItems}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-serif text-xl font-semibold text-stone-950">Browse all watches</h3>
              <p className="mt-1 text-xs text-stone-500">
                {loading ? 'Loading the collection…' : `${totalItems} ${totalItems === 1 ? 'watch' : 'watches'} to explore`}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="sr-only" htmlFor="home-price-filter">Filter by price</label>
              <select id="home-price-filter" value={selectedPriceRange} onChange={resetPage(setSelectedPriceRange)} className="min-h-10 rounded-xl border border-stone-200 bg-[#fbfaf7] px-3 text-xs text-stone-700 outline-none focus:border-emerald-800">
                {priceRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
              </select>
              <label className="sr-only" htmlFor="home-brand-filter">Filter by brand</label>
              <select id="home-brand-filter" value={selectedBrand} onChange={resetPage(setSelectedBrand)} className="min-h-10 rounded-xl border border-stone-200 bg-[#fbfaf7] px-3 text-xs text-stone-700 outline-none focus:border-emerald-800">
                <option value="">All brands</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <label className="sr-only" htmlFor="home-category-filter">Filter by category</label>
              <select id="home-category-filter" value={selectedCategory} onChange={resetPage(setSelectedCategory)} className="min-h-10 rounded-xl border border-stone-200 bg-[#fbfaf7] px-3 text-xs text-stone-700 outline-none focus:border-emerald-800">
                <option value="">All styles</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
          </div>
          {(selectedPriceRange || selectedBrand || selectedCategory) && (
            <button type="button" onClick={clearFilters} className="mt-3 text-xs font-semibold text-emerald-900 underline underline-offset-4">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center" role="status">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
              Loading watches…
            </div>
          </div>
        ) : error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-white px-5 py-8 text-center">
            <p role="alert" className="text-sm text-rose-800">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
            <h3 className="font-serif text-xl font-semibold text-stone-950">No watches match those filters</h3>
            <p className="mt-2 text-sm text-stone-600">Try another combination or clear your filters.</p>
            <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-emerald-900 underline underline-offset-4">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  cartItems={cartItems}
                  wishlistItems={wishlistItems}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <nav aria-label="Collection pages" className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft aria-hidden="true" size={12} />
                </button>
                <span className="text-xs font-medium text-stone-600">Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronRight aria-hidden="true" size={12} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, cartItems, wishlistItems, onAddToCart, onToggleWishlist }) {
  const isInCart = cartItems.includes(product._id);
  const isInWishlist = wishlistItems.includes(product._id);
  const isAvailable = Number(product.stock) > 0;
  const image = Array.isArray(product.product_images) ? product.product_images[0] : product.product_images;

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
        <Link to={`/product/${product._id}`} aria-label={`View ${product.title || 'watch'}`} className="block h-full w-full">
          <img
            src={image || fallbackImage}
            alt={product.title || 'Watch'}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = fallbackImage; }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          isAvailable ? 'bg-white/90 text-emerald-900' : 'bg-stone-900/80 text-white'
        }`}>
          {isAvailable ? 'Available' : 'Sold out'}
        </span>
        <button
          type="button"
          onClick={() => onToggleWishlist(product._id)}
          aria-label={isInWishlist ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          aria-pressed={isInWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
            isInWishlist ? 'bg-rose-700 text-white' : 'bg-white/90 text-stone-700 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <FaHeart aria-hidden="true" size={13} />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          {product.brand || 'Clyro collection'}
        </p>
        <Link to={`/product/${product._id}`} className="mt-1 block">
          <h3 className="truncate font-serif text-lg font-semibold text-stone-950 transition hover:text-emerald-900">
            {product.title || 'Watch'}
          </h3>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-emerald-950">{formatPrice(product.price)}</p>
          <p className={`text-xs ${isAvailable ? 'text-stone-500' : 'font-medium text-rose-700'}`}>
            {isAvailable ? `${product.stock} in stock` : 'Currently unavailable'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddToCart(product._id)}
          disabled={!isAvailable || isInCart}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        >
          <FaShoppingBag aria-hidden="true" />
          {!isAvailable ? 'Out of stock' : isInCart ? 'In your bag' : 'Add to bag'}
        </button>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    product_images: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  }).isRequired,
  cartItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  wishlistItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
};
