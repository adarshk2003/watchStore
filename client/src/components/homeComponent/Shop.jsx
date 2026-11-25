import { API_BASE_URL } from '../../config/api.js';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Slider from 'rc-slider';
import { addToCart } from './cartUtil';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { addToWishlist, removeFromWishlist } from './wishlistUtil';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import 'rc-slider/assets/index.css';
import NavBaruser from "../navComponent/userNav";

const baseUrl = API_BASE_URL;

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000000]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  const fetchCartItems = useCallback(async () => {
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(localCart);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/viewCart`, {
        headers: { Authorization: `bearer ${token}` },
      });
      const cartProductIds = response.data.items.map((item) => item.productId._id);
      setCartItems(cartProductIds);
      localStorage.setItem("cartItems", JSON.stringify(cartProductIds));
    } catch (err) {
      console.error("Error fetching cart items:", err);
    }
  }, [token]);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${baseUrl}/viewWishlist`, {
        headers: { Authorization: `bearer ${token}` },
      });
      setWishlistItems(response.data.items.map((item) => item.productId._id));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchCartItems(), fetchWishlist()]);
      } catch (err) {
        console.error('Could not load shopping bag and wishlist state:', err);
      }
    };

    if (token) {
      fetchData();
    } else {
      console.log("No token found.");
    }
  }, [token, fetchCartItems, fetchWishlist]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${baseUrl}/products`, {
          params: {
            page,
            limit: 16,
            availableOnly: true,
            includeFacets: true,
            minPrice: selectedPriceRange[0],
            maxPrice: selectedPriceRange[1],
            brand: selectedBrand || undefined,
            category: selectedCategory || undefined,
          },
        });
        const productsData = response.data?.data;
        const pagination = response.data?.pagination;
        if (!Array.isArray(productsData) || !pagination) {
          throw new Error('Invalid paginated product response.');
        }
        if (!active) return;
        setProducts(productsData);
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
        if (response.data.facets) {
          setBrands(response.data.facets.brands || []);
          setCategories(response.data.facets.categories || []);
        }
      } catch (requestError) {
        console.error('Error fetching products:', requestError);
        if (active) setError(requestError.response?.data?.message || 'Error fetching products');
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, selectedPriceRange, selectedBrand, selectedCategory]);

  const paginatedProducts = products;

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedPriceRange([0, 1000000]);
    setSelectedBrand('');
    setSelectedCategory('');
    setPage(1);
  };

  const handlePagination = (pageNum) => {
    setPage(pageNum);
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const { success } = await addToCart(productId, setCartItems);
    if (success) {
      const updatedCart = [...cartItems, productId];
      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (wishlistItems.includes(productId)) {
      removeFromWishlist(productId, token, setWishlistItems);
    } else {
      addToWishlist(productId, token, setWishlistItems);
    }
  };

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 pb-16 pt-8 text-stone-900 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-7xl">
          <div className="mb-9 border-b border-stone-200 pb-7 sm:mb-10 sm:pb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">The Clyro collection</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Find your timepiece</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                  Discover considered watches chosen for craftsmanship, character, and everyday wear.
                </p>
              </div>
              <p className="text-sm text-stone-500" aria-live="polite">
                {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition hover:border-emerald-900"
            >
              <FaFilter aria-hidden="true" />
              {showFilters ? 'Hide filters' : 'Filters'}
            </button>
            <span className="text-xs text-stone-500">Refine your selection</span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
            <aside className={`${showFilters ? 'block' : 'hidden'} h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:block`}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">Refine</h2>
                <button type="button" onClick={clearFilters} className="text-xs font-semibold text-emerald-900 underline underline-offset-4">
                  Clear all
                </button>
              </div>
              <label className="mb-4 block text-sm font-semibold text-stone-800">Price range</label>
              <Slider
                range
                min={0}
                max={1000000}
                step={100}
                value={selectedPriceRange}
                onChange={handlePriceChange}
                trackStyle={[{ backgroundColor: '#065f46' }]}
                handleStyle={[{ borderColor: '#065f46', backgroundColor: '#fff' }]}
                railStyle={{ backgroundColor: '#e7e5e4' }}
              />
              <div className="mt-3 flex justify-between text-xs text-stone-600">
                <span>₹{selectedPriceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{selectedPriceRange[1].toLocaleString('en-IN')}</span>
              </div>
              <label htmlFor="shop-brand" className="mb-2 mt-7 block text-sm font-semibold text-stone-800">Brand</label>
              <select
                id="shop-brand"
                value={selectedBrand}
                onChange={(event) => { setSelectedBrand(event.target.value); setPage(1); }}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <label htmlFor="shop-category" className="mb-2 mt-5 block text-sm font-semibold text-stone-800">Style</label>
              <select
                id="shop-category"
                value={selectedCategory}
                onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All styles</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </aside>

            <section aria-label="Watches">
              {loading ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-600" role="status">Loading the collection…</div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-700" role="alert">{error}</div>
              ) : paginatedProducts.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
                  <h2 className="font-serif text-2xl font-semibold">No watches match those filters</h2>
                  <p className="mt-2 text-sm text-stone-500">Try another brand, style, or price range.</p>
                  <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                    {paginatedProducts.map((product) => {
                      const imageUrl = product.product_images?.[0] || '/Omega.jpeg';
                      const isInCart = cartItems.includes(product._id);
                      const isInWishlist = wishlistItems.includes(product._id);

                      return (
                        <article key={product._id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div className="relative bg-[#f1eee7] p-3 sm:p-5">
                            <Link to={`/product/${product._id}`} aria-label={`View ${product.title || product.name || 'watch'}`}>
                            <img
                              src={imageUrl}
                              alt={product.title || product.name || 'Watch'}
                              className="h-40 w-full object-contain transition duration-500 group-hover:scale-105 sm:h-56"
                            />
                            </Link>
                            <button
                              type="button"
                              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                              onClick={(event) => { event.stopPropagation(); handleAddToWishlist(product._id); }}
                              className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${isInWishlist ? 'bg-rose-700 text-white' : 'bg-white text-stone-700 hover:text-rose-700'}`}
                            >
                              <FontAwesomeIcon icon={faHeart} />
                            </button>
                          </div>
                          <div className="p-3 sm:p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-900 sm:text-xs">{product.brand || 'Clyro'}</p>
                            <h2 className="mt-1 truncate font-serif text-base font-semibold sm:text-lg">
                              <Link to={`/product/${product._id}`} className="hover:text-emerald-900">
                                {product.title || product.name || 'Untitled watch'}
                              </Link>
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-stone-800">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product._id)}
                              disabled={isInCart || product.stock <= 0}
                              className="mt-4 w-full rounded-xl border border-emerald-950 px-3 py-2.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-950 hover:text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-500 sm:text-sm"
                            >
                              {product.stock <= 0 ? 'Out of stock' : isInCart ? 'In your cart' : 'Add to cart'}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => handlePagination(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
                      <button
                        type="button"
                        onClick={() => handlePagination(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </main>
    </>
  );
};

export default Shop;
