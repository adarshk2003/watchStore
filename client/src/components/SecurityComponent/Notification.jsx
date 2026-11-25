import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaBoxOpen, FaCalendarAlt } from 'react-icons/fa';

const formatDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
};

const orderStatus = (status) => {
  const normalized = String(status || 'pending').toLowerCase();
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'cancelled') return 'Cancelled';
  return 'Processing';
};

export default function OrderActivity() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Sign in to view your order activity.');
      return undefined;
    }

    let active = true;
    axios.get(`${API_BASE_URL}/viewOrders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!active) return;
        if (!Array.isArray(response.data?.orders)) {
          setError('We could not read your order activity. Please try again.');
          return;
        }
        setOrders(response.data.orders);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 404) {
          setOrders([]);
          return;
        }
        setError(requestError.response?.data?.message || 'We could not load your order activity. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const recentOrders = [...orders]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
          <FaArrowLeft aria-hidden="true" size={12} /> Back to Clyro
        </Link>
        <header className="mt-6 rounded-3xl bg-emerald-950 p-6 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Your account</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Order activity</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">
            Recent updates based on your order history. This page does not provide real-time or persistent notifications.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
          {loading ? (
            <p role="status" className="py-10 text-center text-sm text-stone-600">Loading your order activity...</p>
          ) : error ? (
            <div className="py-8 text-center">
              <p role="alert" className="text-sm text-rose-700">{error}</p>
              {!token && (
                <Link to="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white hover:bg-emerald-800">
                  Sign in
                </Link>
              )}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center">
              <FaBoxOpen aria-hidden="true" className="mx-auto text-3xl text-stone-400" />
              <h2 className="mt-4 font-serif text-xl font-semibold text-stone-950">No order activity yet</h2>
              <p className="mt-2 text-sm text-stone-600">When you place an order, its latest recorded status will appear here.</p>
              <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white hover:bg-emerald-800">
                Explore watches
              </Link>
            </div>
          ) : (
            <ol className="divide-y divide-stone-100">
              {recentOrders.map((order) => {
                const products = (order.products || [])
                  .map((item) => item.productId?.title)
                  .filter(Boolean);
                const description = products.length > 0
                  ? products.slice(0, 2).join(', ') + (products.length > 2 ? ` and ${products.length - 2} more` : '')
                  : 'Your order';

                return (
                  <li key={order._id} className="flex gap-4 py-5 first:pt-1 last:pb-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                      <FaBoxOpen aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-stone-950">{orderStatus(order.status)} order</h2>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
                          #{String(order._id || '').slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-stone-600">{description}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                        <FaCalendarAlt aria-hidden="true" /> {formatDate(order.updatedAt || order.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {!loading && !error && orders.length > 0 && (
            <div className="mt-5 border-t border-stone-100 pt-5">
              <Link to="/orders" className="text-sm font-semibold text-emerald-950 underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-900">
                View all orders
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
