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
import { FaBan, FaBox, FaChartLine, FaPlus, FaStore } from 'react-icons/fa';
import NavSellerCom from './NavSellerCom';

const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const getBucket = (date, period) => {
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
};

const formatBucketLabel = (date, period) => {
  if (period === 'yearly') return String(date.getFullYear());
  if (period === 'monthly') {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
};

function groupSalesByPeriod(orders, period) {
  const groups = new Map();
  orders.forEach((order) => {
    if (String(order.status || '').toLowerCase() === 'cancelled') return;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const bucket = getBucket(date, period);
    const key = bucket.getTime();
    const group = groups.get(key) || {
      name: formatBucketLabel(bucket, period),
      sales: 0,
      sortKey: key,
    };
    group.sales += Number(order.total) || 0;
    groups.set(key, group);
  });
  return [...groups.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => ({ name: entry.name, sales: entry.sales }));
}

export default function DashboardSeller() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('Your seller session could not be identified. Please sign in again.');
      setLoading(false);
      return () => { active = false; };
    }

    const loadSellerDashboard = async () => {
      setLoading(true);
      setError('');
      const headers = { Authorization: `bearer ${token}` };
      try {
        const [productsResult, ordersResult] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/products/seller/${userId}`, { headers }),
          axios.get(`${API_BASE_URL}/viewSellerOrders`, { headers }),
        ]);

        if (ordersResult.status === 'rejected') throw ordersResult.reason;
        const orderData = ordersResult.value.data?.data;
        if (!Array.isArray(orderData)) {
          throw new Error('The seller order response was not in the expected format.');
        }

        let productData = [];
        if (productsResult.status === 'fulfilled') {
          productData = productsResult.value.data?.data;
          if (!Array.isArray(productData)) {
            throw new Error('The seller inventory response was not in the expected format.');
          }
        } else if (productsResult.reason.response?.status !== 404) {
          throw productsResult.reason;
        }

        if (!active) return;
        setProducts(productData);
        setSellerOrders(orderData);
      } catch (requestError) {
        console.error('Could not load seller dashboard:', requestError);
        if (!active) return;
        setError(
          requestError.response?.data?.message ||
            'We could not load your store overview. Please try again.'
        );
        if (requestError.response?.status === 401) toast.error('Session expired. Please sign in again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSellerDashboard();
    return () => { active = false; };
  }, [refreshKey]);

  const sales = useMemo(
    () => groupSalesByPeriod(sellerOrders, selectedPeriod),
    [sellerOrders, selectedPeriod]
  );
  const totalSales = sales.reduce((sum, item) => sum + item.sales, 0);
  const attentionProducts = products.filter(
    (product) => product.isStatus || Number(product.stock) <= 0
  );

  return (
    <>
      <NavSellerCom />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 pb-14 pt-8 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-3xl bg-emerald-950 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Seller workspace</p>
                <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">Your store, at a glance</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">
                  Monitor orders and order value, and keep your watch collection up to date.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/myproducts" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">
                  <FaStore aria-hidden="true" /> Manage products
                </Link>
                <Link to="/addproduct" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100">
                  <FaPlus aria-hidden="true" /> Add a watch
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

          <section aria-label="Store metrics" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Products in collection" value={products.length} icon={<FaBox aria-hidden="true" />} loading={loading} />
            <MetricCard label="Orders received" value={sellerOrders.length} icon={<FaChartLine aria-hidden="true" />} loading={loading} />
            <MetricCard label="Order value, selected period" value={`₹${totalSales.toLocaleString('en-IN')}`} icon={<FaStore aria-hidden="true" />} loading={loading} />
          </section>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Performance</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Order value overview</h2>
                <p className="mt-1 text-xs text-stone-500">Based on non-cancelled orders containing your products.</p>
              </div>
              <label className="text-sm font-medium text-stone-600" htmlFor="seller-period">
                Period
                <select
                  id="seller-period"
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
              <p className="mt-6 rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">Chart data is unavailable until your dashboard loads.</p>
            ) : sales.length === 0 ? (
              <ChartEmpty text="Order activity will appear here when an order includes one of your watches." />
            ) : (
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sales} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Order value']} />
                    <Line type="monotone" dataKey="sales" stroke="#047857" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Inventory attention</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Availability</h2>
              </div>
              {!loading && (
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  attentionProducts.length ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'
                }`}>
                  {attentionProducts.length} need attention
                </span>
              )}
            </div>
            {loading ? (
              <LoadingMessage />
            ) : error ? (
              <p className="mt-5 rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">Inventory status is unavailable until your dashboard loads.</p>
            ) : attentionProducts.length > 0 ? (
              <ul className="mt-5 divide-y divide-stone-100">
                {attentionProducts.map((product) => (
                  <li key={product._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 text-sm text-stone-700">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                        <FaBan aria-hidden="true" />
                      </span>
                      <span className="font-medium">{product.title || 'Untitled product'}</span>
                    </div>
                    <span className="text-xs text-stone-500">
                      {product.isStatus ? 'Blocked listing' : 'Out of stock'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">All your listings have stock and are currently available.</p>
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

function LoadingMessage() {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status">
      <div className="flex items-center gap-3 text-sm text-stone-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
        Loading your store data…
      </div>
    </div>
  );
}

function ChartEmpty({ text }) {
  return (
    <div className="mt-6 flex h-72 items-center justify-center rounded-xl bg-[#f7f6f2] px-5 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}

ChartEmpty.propTypes = {
  text: PropTypes.string.isRequired,
};
