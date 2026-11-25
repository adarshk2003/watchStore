import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import NavBaruser from '../navComponent/userNav';
import { FaArrowLeft, FaCheck, FaLock, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';

const CONVENIENCE_FEE = 19;
const PLATFORM_FEE = 29;

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cartItems = useMemo(
    () => (Array.isArray(state?.cartItems) ? state.cartItems : []),
    [state?.cartItems]
  );
  const itemCount = cartItems.reduce((count, item) => count + (Number(item.quantity) || 1), 0);
  const subtotalInCents = useMemo(
    () => cartItems.reduce((sum, item) => {
      const priceInCents = Math.round((Number(item.productId?.price) || 0) * 100);
      const quantity = Number(item.quantity) || 1;
      return sum + priceInCents * quantity;
    }, 0),
    [cartItems]
  );
  const subtotal = subtotalInCents / 100;
  const orderTotal = (subtotalInCents + (CONVENIENCE_FEE + PLATFORM_FEE) * 100) / 100;
  const hasInvalidItems = cartItems.some(
    (item) => !item.productId?._id || !Number.isSafeInteger(Number(item.quantity) || 1) || Number(item.quantity || 1) < 1
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (cartItems.length === 0 || hasInvalidItems) {
      setLoadingAddress(false);
      setError(cartItems.length === 0
        ? 'Your checkout session is empty. Add items to your bag to continue.'
        : 'Some items in this checkout are invalid. Return to your bag and try again.');
      return;
    }

    let active = true;
    axios.get(`${API_BASE_URL}/userprofile`, {
      headers: { Authorization: `bearer ${token}` },
    })
      .then((response) => {
        if (active) setAddress(response.data?.data?.address || '');
      })
      .catch((requestError) => {
        console.error('Could not load saved delivery address:', requestError);
        if (active) setError('We could not load your saved address. You can still enter it below.');
      })
      .finally(() => {
        if (active) setLoadingAddress(false);
      });

    return () => {
      active = false;
    };
  }, [cartItems.length, hasInvalidItems, navigate]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    const normalizedAddress = address.trim();
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (!normalizedAddress) {
      setError('Enter a delivery address to continue.');
      return;
    }
    if (normalizedAddress.length > 500) {
      setError('The delivery address must be 500 characters or fewer.');
      return;
    }
    if (cartItems.length === 0 || hasInvalidItems) {
      setError('Your checkout items are invalid. Return to your bag and try again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/createOrder`,
        {
          products: cartItems.map((item) => ({
            productId: item.productId._id,
            quantity: Number(item.quantity) || 1,
          })),
          address: normalizedAddress,
          paymentMethod: 'cash',
          expectedTotal: Number(orderTotal.toFixed(2)),
        },
        { headers: { Authorization: `bearer ${token}` } }
      );

      toast.success('Your order has been placed.');
      navigate('/conformed', {
        replace: true,
        state: { orderId: response.data?.order?._id },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 pb-16 pt-7 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
            <FaArrowLeft aria-hidden="true" /> Back to your bag
          </Link>
          <div className="mb-8 mt-5 border-b border-stone-200 pb-7 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Almost yours</p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Checkout</h1>
            <p className="mt-3 text-sm text-stone-600">Confirm your delivery details and place a cash-on-delivery order.</p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              {error}
              {cartItems.length === 0 && (
                <Link to="/shop" className="ml-2 font-semibold underline underline-offset-4">Browse watches</Link>
              )}
            </div>
          )}

          {cartItems.length > 0 && !hasInvalidItems && (
            <form onSubmit={handlePlaceOrder} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
              <div className="space-y-5">
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                      <FaMapMarkerAlt aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Step 1</p>
                      <h2 className="mt-1 font-serif text-2xl font-semibold">Delivery address</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-500">Where should we deliver your watches?</p>
                    </div>
                  </div>
                  <label htmlFor="checkout-address" className="mt-6 block text-sm font-semibold text-stone-800">
                    Shipping address
                    <textarea
                      id="checkout-address"
                      name="address"
                      autoComplete="street-address"
                      maxLength={500}
                      required
                      rows={4}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      disabled={loadingAddress}
                      placeholder={loadingAddress ? 'Loading your saved address…' : 'House / apartment, street, city, state, postal code'}
                      className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-normal leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-50"
                    />
                  </label>
                  <p className="mt-2 text-xs text-stone-400">{address.length}/500 characters</p>
                  <Link to="/profile" className="mt-3 inline-flex text-xs font-semibold text-emerald-900 underline underline-offset-4">
                    Manage saved profile address
                  </Link>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                      <FaTruck aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Step 2</p>
                      <h2 className="mt-1 font-serif text-2xl font-semibold">Payment & delivery</h2>
                      <div className="mt-4 rounded-xl border border-stone-200 bg-[#f7f6f2] p-4">
                        <p className="text-sm font-semibold text-stone-900">Cash on delivery</p>
                        <p className="mt-1 text-xs leading-5 text-stone-500">Pay when your order arrives. Delivery is free.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Your order</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Order summary</h2>
                <div className="mt-5 max-h-64 space-y-4 overflow-y-auto border-b border-stone-200 pb-5">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const quantity = Number(item.quantity) || 1;
                    return (
                      <div key={product._id} className="flex items-center gap-3">
                        <img
                          src={product.product_images?.[0] || '/Omega.jpeg'}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl bg-[#f1eee7] object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-900">{product.title || product.name}</p>
                          <p className="mt-1 text-xs text-stone-500">Qty {quantity}</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium">{formatPrice((Number(product.price) || 0) * quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <dl className="mt-5 space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between gap-4">
                    <dt>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
                    <dd className="font-medium text-stone-900">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Convenience fee</dt>
                    <dd className="font-medium text-stone-900">{formatPrice(CONVENIENCE_FEE)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Platform fee</dt>
                    <dd className="font-medium text-stone-900">{formatPrice(PLATFORM_FEE)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Delivery</dt>
                    <dd className="font-semibold text-emerald-900">Free</dd>
                  </div>
                </dl>
                <div className="mt-5 flex justify-between border-t border-stone-200 pt-5 text-base font-semibold">
                  <span>Total due on delivery</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading || loadingAddress}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {loading ? 'Placing your order…' : <><FaCheck aria-hidden="true" /> Place order</>}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
                  <FaLock aria-hidden="true" /> Secure checkout · Cash on delivery
                </p>
              </aside>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
