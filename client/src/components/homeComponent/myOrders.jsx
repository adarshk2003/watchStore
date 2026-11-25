import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import NavBaruser from '../navComponent/userNav';
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaReceipt, FaShoppingBag } from 'react-icons/fa';

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
};

const statusDetails = (status) => {
  const normalized = String(status || 'pending').toLowerCase();
  if (normalized === 'completed') {
    return { label: 'Completed', className: 'bg-emerald-50 text-emerald-900', progress: 100 };
  }
  if (normalized === 'cancelled') {
    return { label: 'Cancelled', className: 'bg-rose-50 text-rose-800', progress: 0 };
  }
  return { label: 'Processing', className: 'bg-amber-50 text-amber-900', progress: 45 };
};

const OrderDetailPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Sign in to view your orders.');
      return undefined;
    }

    let active = true;
    axios.get(`${API_BASE_URL}/viewOrders`, {
      headers: { Authorization: `bearer ${token}` },
    })
      .then((response) => {
        if (active && Array.isArray(response.data?.orders)) {
          setOrders(response.data.orders);
          setError('');
        }
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 404) {
          setOrders([]);
          setError('');
          return;
        }
        setError(requestError.response?.data?.message || 'We could not load your order history. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((order) => String(order.status || 'pending').toLowerCase() === filter);
  }, [filter, orders]);

  const totalOrderValue = orders.reduce((total, order) => (
    String(order.status || 'pending').toLowerCase() === 'cancelled'
      ? total
      : total + (Number(order.total) || 0)
  ), 0);

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 pb-16 pt-7 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 border-b border-stone-200 pb-7 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Your Clyro account</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Order history</h1>
                <p className="mt-3 text-sm text-stone-600">View your purchases, delivery addresses, and order progress.</p>
              </div>
              {!loading && orders.length > 0 && (
                <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950">
                  <FaShoppingBag aria-hidden="true" /> Continue shopping
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-600" role="status">
              Loading your orders…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="text-sm text-red-700" role="alert">{error}</p>
              {!token && (
                <Link to="/login" className="mt-5 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
                  Sign in
                </Link>
              )}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1eee7] text-emerald-950">
                <FaBoxOpen aria-hidden="true" size={24} />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold">Your story starts with a watch</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Orders you place will appear here with their delivery and payment details.
              </p>
              <Link to="/shop" className="mt-6 inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Explore the collection
              </Link>
            </div>
          ) : (
            <>
              <section className="mb-6 grid gap-4 sm:grid-cols-2">
                <SummaryCard icon={<FaReceipt />} label="Orders placed" value={orders.length.toLocaleString('en-IN')} />
                <SummaryCard icon={<FaShoppingBag />} label="Total order value" value={formatPrice(totalOrderValue)} />
              </section>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-stone-500">{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} shown</p>
                <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  Status
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="all">All orders</option>
                    <option value="pending">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
                  No {filter} orders to show.
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredOrders.map((order) => {
                    const status = statusDetails(order.status);
                    return (
                      <article key={order._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-[#fbfaf7] px-5 py-4 sm:px-6">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Order reference</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-stone-900">#{String(order._id).slice(-10).toUpperCase()}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 text-xs text-stone-500">
                              <FaCalendarAlt aria-hidden="true" /> {formatDate(order.createdAt)}
                            </span>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                          </div>
                        </div>

                        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_250px]">
                          <div className="space-y-4">
                            {(order.products || []).map((item, index) => {
                              const product = item.productId;
                              const unitPrice = Number(item.unitPrice ?? product?.price ?? 0);
                              const quantity = Number(item.quantity) || 1;
                              return (
                                <div key={product?._id || `${order._id}-${index}`} className="flex items-center gap-4">
                                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1eee7] p-2">
                                    <img
                                      src={product?.product_images?.[0] || '/Omega.jpeg'}
                                      alt={product?.title || 'Purchased watch'}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-900">{product?.brand || 'Clyro'}</p>
                                    <h3 className="mt-1 truncate font-serif text-base font-semibold">{product?.title || 'Watch'}</h3>
                                    <p className="mt-1 text-xs text-stone-500">{formatPrice(unitPrice)} × {quantity}</p>
                                  </div>
                                  <p className="shrink-0 text-sm font-semibold">{formatPrice(unitPrice * quantity)}</p>
                                </div>
                              );
                            })}
                          </div>

                          <aside className="rounded-xl bg-[#f7f6f2] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Delivery to</p>
                            <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-stone-700">
                              <FaMapMarkerAlt className="mt-1 shrink-0 text-emerald-900" aria-hidden="true" />
                              <span>{order.address || 'Address unavailable'}</span>
                            </p>
                            <div className="mt-4 border-t border-stone-200 pt-4">
                              <p className="text-xs text-stone-500">Payment</p>
                              <p className="mt-1 text-sm font-medium text-stone-800">Cash on delivery</p>
                            </div>
                            <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-sm font-semibold">
                              <span>Order total</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </aside>
                        </div>

                        {String(order.status || 'pending').toLowerCase() !== 'cancelled' && (
                          <div className="border-t border-stone-100 px-5 py-5 sm:px-6">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Order progress</p>
                              <p className="text-xs font-semibold text-emerald-900">{status.label}</p>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
                              <div className="h-full rounded-full bg-emerald-800 transition-all" style={{ width: `${status.progress}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] text-stone-500 sm:text-xs">
                              <span>Placed</span><span>Processing</span><span>Completed</span>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

function SummaryCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-900" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-stone-950">{value}</p>
      </div>
    </div>
  );
}

SummaryCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default OrderDetailPage;
