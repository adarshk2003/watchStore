import { API_BASE_URL } from '../../config/api.js';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaHeart, FaRegClock, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavBaruser from '../navComponent/userNav';
import { addToCart } from './cartUtil';

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;

    const fetchWishlistAndCart = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setCartError(false);

      const [wishlistResult, cartResult] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/viewWishlist`, {
          headers: { Authorization: `bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/viewCart`, {
          headers: { Authorization: `bearer ${token}` },
        }),
      ]);

      if (!active) return;

      if (wishlistResult.status === 'fulfilled') {
        const items = wishlistResult.value.data?.items;
        setWishlist(Array.isArray(items) ? items.filter((item) => item?.productId) : []);
      } else {
        console.error('Could not load wishlist:', wishlistResult.reason);
        setError(
          wishlistResult.reason.response?.data?.message ||
            'We could not load your wishlist. Please try again.'
        );
      }

      if (cartResult.status === 'fulfilled') {
        const items = cartResult.value.data?.items;
        setCartItems(
          Array.isArray(items)
            ? items.map((item) => item?.productId?._id || item?.productId).filter(Boolean)
            : []
        );
      } else {
        console.error('Could not check shopping bag items:', cartResult.reason);
        setCartError(true);
      }

      setLoading(false);
    };

    fetchWishlistAndCart();
    return () => {
      active = false;
    };
  }, [token, refreshKey]);

  const markProcessing = useCallback((productId, processing) => {
    setProcessingIds((current) => (
      processing
        ? [...new Set([...current, productId])]
        : current.filter((id) => id !== productId)
    ));
  }, []);

  const handleRemove = async (productId) => {
    markProcessing(productId, true);
    try {
      await axios.delete(`${API_BASE_URL}/deleteWishlist/${productId}`, {
        headers: { Authorization: `bearer ${token}` },
      });
      setWishlist((current) => current.filter((item) => item.productId?._id !== productId));
      toast.success('Removed from your wishlist.');
    } catch (requestError) {
      console.error('Could not remove wishlist item:', requestError);
      toast.error(requestError.response?.data?.message || 'Could not remove this item. Please try again.');
    } finally {
      markProcessing(productId, false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    markProcessing(productId, true);
    try {
      const result = await addToCart(productId);
      if (result?.success) {
        setCartItems((current) => current.includes(productId) ? current : [...current, productId]);
      }
    } finally {
      markProcessing(productId, false);
    }
  };

  const productItems = wishlist.filter((item) => item?.productId?._id);

  return (
    <>
      <NavBaruser />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Saved for later</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                Your wishlist
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                Keep the watches you love close by, and move them to your bag whenever you’re ready.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-emerald-900 hover:text-emerald-950"
            >
              Explore watches <FaArrowRight aria-hidden="true" size={12} />
            </Link>
          </div>

          {cartError && !error && (
            <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your wishlist loaded, but we couldn’t check which items are already in your bag.
            </p>
          )}

          {loading ? (
            <div className="flex min-h-72 items-center justify-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
                Loading your saved watches…
              </div>
            </div>
          ) : !token ? (
            <section className="mx-auto mt-12 max-w-lg rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm sm:mt-16 sm:px-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-800">
                <FaHeart aria-hidden="true" size={21} />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-stone-950">Sign in to see your wishlist</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Your saved watches are waiting for you when you sign in.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-6 rounded-xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Sign in
              </button>
            </section>
          ) : error ? (
            <section className="mx-auto mt-12 max-w-lg rounded-3xl border border-rose-200 bg-white px-6 py-10 text-center shadow-sm">
              <p role="alert" className="text-sm leading-6 text-rose-800">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="mt-5 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Try again
              </button>
            </section>
          ) : productItems.length === 0 ? (
            <section className="mx-auto mt-12 max-w-lg rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm sm:mt-16 sm:px-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-800">
                <FaHeart aria-hidden="true" size={21} />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-stone-950">Your wishlist is waiting</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Save a watch that catches your eye and it will be easy to find here.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Find your next watch <FaArrowRight aria-hidden="true" size={12} />
              </Link>
            </section>
          ) : (
            <>
              <div className="flex items-center justify-between py-5">
                <p className="text-sm text-stone-600">
                  <span className="font-semibold text-stone-950">{productItems.length}</span>{' '}
                  {productItems.length === 1 ? 'watch saved' : 'watches saved'}
                </p>
                <span className="hidden items-center gap-2 text-xs text-stone-500 sm:inline-flex">
                  <FaRegClock aria-hidden="true" /> Ready whenever you are
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productItems.map(({ productId: product }) => {
                  const unavailable = product.isStatus || Number(product.stock) <= 0;
                  const inCart = cartItems.includes(product._id);
                  const processing = processingIds.includes(product._id);
                  const image = Array.isArray(product.product_images)
                    ? product.product_images[0]
                    : product.product_images;

                  return (
                    <article key={product._id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <Link
                        to={`/product/${product._id}`}
                        aria-label={`View ${product.title}`}
                        className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200"
                      >
                        {image && (
                          <img
                            src={image}
                            alt={product.title || 'Saved watch'}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                          {unavailable ? 'Unavailable' : 'Saved'}
                        </span>
                      </Link>
                      <div className="p-4 sm:p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                          {product.brand || 'Clyro collection'}
                        </p>
                        <Link to={`/product/${product._id}`} className="mt-2 block">
                          <h2 className="truncate font-serif text-lg font-semibold text-stone-950 transition group-hover:text-emerald-900">
                            {product.title || 'Watch'}
                          </h2>
                        </Link>
                        <p className="mt-2 text-base font-semibold text-emerald-950">{formatPrice(product.price)}</p>
                        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product._id)}
                            disabled={processing || inCart || unavailable}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
                          >
                            <FaShoppingBag aria-hidden="true" />
                            {unavailable ? 'Unavailable' : inCart ? 'In your bag' : 'Add to bag'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(product._id)}
                            disabled={processing}
                            aria-label={`Remove ${product.title || 'watch'} from wishlist`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-50"
                          >
                            <FaTrash aria-hidden="true" size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
