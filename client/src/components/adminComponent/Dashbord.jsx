import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FaArrowRight, FaBox, FaChartLine, FaCog, FaUsers } from 'react-icons/fa';
import NavAdminCommon from './NavAdminCommon';

const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function getBucket(date, period) {
  const bucket = new Date(date);
  if (period === 'daily') {
    bucket.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    bucket.setDate(bucket.getDate() - ((bucket.getDay() + 6) % 7));
    bucket.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    bucket.setDate(1);
    bucket.setHours(0, 0, 0, 0);
  } else {
    bucket.setMonth(0, 1);
    bucket.setHours(0, 0, 0, 0);
  }
  return bucket;
}

function formatBucketLabel(date, period) {
  if (period === 'yearly') return String(date.getFullYear());
  if (period === 'monthly') {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}

function groupData(items, period, metric) {
  const groups = new Map();
  items.forEach((item) => {
    if (metric === 'sales' && String(item.status || '').toLowerCase() === 'cancelled') return;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const bucket = getBucket(date, period);
    const key = bucket.getTime();
    const group = groups.get(key) || { name: formatBucketLabel(bucket, period), [metric]: 0, sortKey: key };
    group[metric] += metric === 'users' ? 1 : Number(item.total) || 0;
    groups.set(key, group);
  });
  return [...groups.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => (
      metric === 'sales'
        ? { name: entry.name, sales: entry.sales }
        : { name: entry.name, users: entry.users }
    ));
}

export default function DashboardAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Your admin session has ended. Please sign in again.');
      setLoading(false);
      return () => { active = false; };
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      const headers = { Authorization: `bearer ${token}` };
      try {
        const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/users`, { headers }),
          axios.get(`${API_BASE_URL}/products`, { headers }),
          axios.get(`${API_BASE_URL}/viewAllOrders`, { headers }),
        ]);
        const userData = usersResponse.data?.data;
        const productData = productsResponse.data?.data;
        const orderData = ordersResponse.data?.data;
        if (![userData, productData, orderData].every(Array.isArray)) {
          throw new Error('The administration data response was not in the expected format.');
        }
        if (!active) return;
        setUsers(userData);
        setProducts(productData);
        setOrders([...orderData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (requestError) {
        console.error('Could not load administration dashboard:', requestError);
        if (!active) return;
        setError(
          requestError.response?.data?.message ||
            'We could not load marketplace activity. Please try again.'
        );
        if (requestError.response?.status === 401) toast.error('Session expired. Please sign in again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, [refreshKey]);

  const sales = useMemo(() => groupData(orders, selectedPeriod, 'sales'), [orders, selectedPeriod]);
  const newUsers = useMemo(() => groupData(users, selectedPeriod, 'users'), [users, selectedPeriod]);
  const totalSales = sales.reduce((sum, item) => sum + item.sales, 0);

  return (
    <>
      <NavAdminCommon />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 pb-14 pt-8 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-3xl bg-emerald-950 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Clyro administration</p>
                <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">Marketplace overview</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">
                  Monitor platform activity and keep the marketplace running smoothly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/alluser" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100">
                  <FaUsers aria-hidden="true" /> Manage users <FaArrowRight aria-hidden="true" className="text-xs" />
                </Link>
                <Link to="/settings" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">
                  <FaCog aria-hidden="true" /> Account settings
                </Link>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-800">
              <p role="alert">{error}</p>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="mt-2 font-semibold underline underline-offset-4">
                Try again
              </button>
            </div>
          )}

          <section aria-label="Marketplace totals" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total users" value={users.length} icon={<FaUsers aria-hidden="true" />} loading={loading} />
            <MetricCard label="Total products" value={products.length} icon={<FaBox aria-hidden="true" />} loading={loading} />
            <MetricCard label="Total orders" value={orders.length} icon={<FaChartLine aria-hidden="true" />} loading={loading} />
            <MetricCard label="Order value, selected period" value={formatCurrency(totalSales)} icon={<FaChartLine aria-hidden="true" />} loading={loading} />
          </section>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Analytics</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Marketplace activity</h2>
                <p className="mt-1 text-xs text-stone-500">Cancelled orders are excluded from order value.</p>
              </div>
              <label className="text-sm font-medium text-stone-600" htmlFor="admin-period">
                Period
                <select
                  id="admin-period"
                  value={selectedPeriod}
                  onChange={(event) => setSelectedPeriod(event.target.value)}
                  className="ml-3 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
                >
                  {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                </select>
              </label>
            </div>

            {loading ? (
              <LoadingMessage />
            ) : error ? (
              <p className="mt-6 rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">Charts are unavailable until dashboard data loads.</p>
            ) : (
              <div className="mt-6 grid gap-8 xl:grid-cols-2">
                <ChartPanel title="Order value">
                  {sales.length ? (
                    <LineChart data={sales} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Order value']} />
                      <Line type="monotone" dataKey="sales" stroke="#047857" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  ) : <ChartEmpty text="No order value in this period." />}
                </ChartPanel>
                <ChartPanel title="New accounts">
                  {newUsers.length ? (
                    <LineChart data={newUsers} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#a27e45" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  ) : <ChartEmpty text="No new accounts in this period." />}
                </ChartPanel>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Order activity</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Recent orders</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-500">{loading ? 'Loading…' : `${orders.length} total`}</span>
                <Link to="/admin-orders" className="text-sm font-semibold text-emerald-900 underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-900">
                  View all orders
                </Link>
              </div>
            </div>
            {loading ? (
              <LoadingMessage />
            ) : error ? (
              <p className="rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">Orders are unavailable until dashboard data loads.</p>
            ) : orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                      <th className="pb-3 pr-4 font-medium">Order</th>
                      <th className="pb-3 pr-4 font-medium">Customer</th>
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((order) => {
                      const status = String(order.status || 'pending').toLowerCase();
                      const statusLabel = status === 'completed'
                        ? 'Completed'
                        : status === 'cancelled'
                          ? 'Cancelled'
                          : 'Pending';
                      return (
                        <tr key={order._id} className="border-b border-stone-100 last:border-0">
                          <td className="py-4 pr-4 font-mono text-xs text-stone-600">#{String(order._id).slice(-8).toUpperCase()}</td>
                          <td className="py-4 pr-4 text-stone-700">{order.userId?.name || order.userId?.email || 'Customer'}</td>
                          <td className="py-4 pr-4 text-xs text-stone-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="py-4 pr-4 font-semibold">{formatCurrency(order.total)}</td>
                          <td className="py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              status === 'completed'
                                ? 'bg-emerald-50 text-emerald-900'
                                : status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-800'
                                  : 'bg-amber-50 text-amber-900'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">No orders have been placed yet.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function MetricCard({ label, value, icon, loading }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-900">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold text-stone-950">{loading ? '—' : typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      </div>
    </article>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node.isRequired,
  loading: PropTypes.bool.isRequired,
};

function ChartPanel({ title, children }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-stone-700">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ChartPanel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ChartEmpty({ text }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-[#f7f6f2] px-4 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}

ChartEmpty.propTypes = {
  text: PropTypes.string.isRequired,
};

function LoadingMessage() {
  return (
    <div className="flex min-h-48 items-center justify-center" role="status">
      <div className="flex items-center gap-3 text-sm text-stone-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
        Loading marketplace data…
      </div>
    </div>
  );
}
