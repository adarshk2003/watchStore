import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavAdmin from './AdminNav';

const ordersPerPage = 25;

const statusClass = (status) => {
  const normalized = String(status || 'pending').toLowerCase();
  if (normalized === 'completed') return 'bg-emerald-50 text-emerald-900';
  if (normalized === 'cancelled') return 'bg-rose-50 text-rose-800';
  return 'bg-amber-50 text-amber-900';
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;
    if (!token) {
      navigate('/login', { replace: true });
      return () => { active = false; };
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/viewAllOrders`, {
          params: { page, limit: ordersPerPage },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data?.data) || !response.data?.pagination) {
          throw new Error('The orders response was not in the expected format.');
        }
        if (active) {
          setOrders(response.data.data);
          setTotalItems(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (requestError) {
        console.error('Could not load admin orders:', requestError);
        if (active) setError(requestError.response?.data?.message || 'We could not load orders. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();
    return () => { active = false; };
  }, [navigate, page, refreshKey, token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/orderStatus/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <>
      <NavAdmin />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <Link to="/admin-home" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
            <FaArrowLeft aria-hidden="true" size={12} /> Back to dashboard
          </Link>
          <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Clyro administration</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950">Order directory</h1>
              <p className="mt-2 text-sm text-stone-600">Review recent marketplace orders and update their current status.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">{totalItems.toLocaleString('en-IN')} orders</span>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-emerald-900"
              >
                Refresh
              </button>
            </div>
          </header>

          <section className="mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-live="polite">
            {loading ? (
              <p className="p-10 text-center text-sm text-stone-600" role="status">Loading orders...</p>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-sm text-rose-800" role="alert">{error}</p>
                <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="mt-4 text-sm font-semibold text-emerald-900 underline underline-offset-4">Try again</button>
              </div>
            ) : orders.length === 0 ? (
              <p className="p-10 text-center text-sm text-stone-600">No orders have been placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-[#fbfaf7]">
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                      <th className="px-5 py-4 font-medium">Order</th>
                      <th className="px-5 py-4 font-medium">Customer</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Items</th>
                      <th className="px-5 py-4 font-medium">Total</th>
                      <th className="px-5 py-4 font-medium">Status (Click to update)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const customer = order.userId && typeof order.userId === 'object' ? order.userId : {};
                      const itemCount = (order.products || []).reduce((count, item) => count + (Number(item.quantity) || 0), 0);
                      return (
                        <tr key={order._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-stone-700">#{String(order._id).slice(-8).toUpperCase()}</td>
                          <td className="px-5 py-4">
                            <span className="block font-medium text-stone-900">{customer.name || 'Customer'}</span>
                            <span className="mt-0.5 block text-xs text-stone-500">{customer.email || 'Email unavailable'}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-stone-600">
                            <span className="inline-flex items-center gap-2"><FaCalendarAlt aria-hidden="true" />{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Date unavailable'}</span>
                          </td>
                          <td className="px-5 py-4 text-stone-700">
                            <span className="inline-flex items-center gap-2"><FaBox aria-hidden="true" className="text-stone-400" />{itemCount}</span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-stone-900">₹{Number(order.total || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-4">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer border border-transparent shadow-xs transition hover:border-stone-300 focus:outline-none ${statusClass(order.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {!loading && !error && totalPages > 1 && (
            <nav aria-label="Order directory pages" className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
