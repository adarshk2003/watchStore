import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { FaArrowRight, FaBoxOpen, FaExclamationTriangle, FaPlus, FaSearch, FaStore, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import NavSellerCom from './NavSellerCom';

const getOwnerId = (value) => (
  typeof value === 'string' ? value : value?._id
);

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

const filters = [
  { value: 'all', label: 'All products' },
  { value: 'available', label: 'Available' },
  { value: 'attention', label: 'Needs attention' },
];

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/products/mine`, {
          headers: { Authorization: `bearer ${token}` },
        });
        const allProducts = response.data?.data;
        if (!Array.isArray(allProducts)) {
          throw new Error('The product list response was not in the expected format.');
        }

        const ownedProducts = allProducts.filter((product) => (
          getOwnerId(product.seller) === userId ||
          getOwnerId(product.userId) === userId ||
          getOwnerId(product.createdBy) === userId
        ));
        if (active) setProducts(ownedProducts);
      } catch (requestError) {
        console.error('Could not load seller products:', requestError);
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'We could not load your products. Please try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [navigate, refreshKey, token, userId]);

  const summary = useMemo(() => ({
    total: products.length,
    available: products.filter((product) => !product.isStatus && Number(product.stock) > 0).length,
    attention: products.filter((product) => product.isStatus || Number(product.stock) <= 0).length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !query || [
        product.title,
        product.brand,
        product.category,
        product.model,
      ].some((value) => String(value || '').toLowerCase().includes(query));
      const needsAttention = product.isStatus || Number(product.stock) <= 0;
      const matchesFilter = activeFilter === 'all' ||
        (activeFilter === 'available' && !needsAttention) ||
        (activeFilter === 'attention' && needsAttention);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, products, search]);

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete "${product.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(product._id);
    try {
      const response = await axios.delete(`${API_BASE_URL}/product/${product._id}`, {
        headers: { Authorization: `bearer ${token}` },
      });
      setProducts((current) => current.filter((item) => item._id !== product._id));
      toast.success(response.data?.message || 'Product deleted.');
    } catch (requestError) {
      console.error('Could not delete seller product:', requestError);
      toast.error(requestError.response?.data?.message || 'Could not delete this product. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const handleContactSupport = (product) => {
    navigate(`/support?productId=${product._id}&productTitle=${encodeURIComponent(product.title || '')}`);
  };

  return (
    <>
      <NavSellerCom />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Seller workspace</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                Product inventory
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                Manage your listings, keep an eye on stock, and update your collection.
              </p>
            </div>
            <Link
              to="/addproduct"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <FaPlus aria-hidden="true" /> Add a watch
            </Link>
          </div>

          <section aria-label="Inventory summary" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard icon={<FaStore aria-hidden="true" />} label="Total listings" value={summary.total} />
            <SummaryCard icon={<FaTag aria-hidden="true" />} label="Available" value={summary.available} />
            <SummaryCard icon={<FaExclamationTriangle aria-hidden="true" />} label="Needs attention" value={summary.attention} />
          </section>

          <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <FaSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, brand, or model"
                  aria-label="Search products"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-[#fbfaf7] pl-11 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
                />
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filter products">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    aria-pressed={activeFilter === filter.value}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeFilter === filter.value
                        ? 'bg-emerald-950 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
                Loading your inventory…
              </div>
            </div>
          ) : error ? (
            <section className="mt-8 rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center">
              <p role="alert" className="text-sm text-rose-800">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="mt-5 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Try again
              </button>
            </section>
          ) : products.length === 0 ? (
            <section className="mt-8 rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-900">
                <FaBoxOpen aria-hidden="true" size={22} />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-stone-950">Your collection starts here</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                Add your first watch listing to start building your storefront.
              </p>
              <Link
                to="/addproduct"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Add your first watch <FaArrowRight aria-hidden="true" size={12} />
              </Link>
            </section>
          ) : filteredProducts.length === 0 ? (
            <section className="mt-8 rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
              <h2 className="font-serif text-xl font-semibold text-stone-950">No matching products</h2>
              <p className="mt-2 text-sm text-stone-600">Try another search or filter.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveFilter('all'); }}
                className="mt-4 text-sm font-semibold text-emerald-900 underline underline-offset-4"
              >
                Clear search and filters
              </button>
            </section>
          ) : (
            <section aria-label="Your products" className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const blocked = Boolean(product.isStatus);
                const outOfStock = Number(product.stock) <= 0;
                const image = Array.isArray(product.product_images)
                  ? product.product_images[0]
                  : product.product_images;
                const deleting = deletingId === product._id;

                return (
                  <article key={product._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <Link
                      to={`/products/${product._id}`}
                      aria-label={`View ${product.title}`}
                      className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200"
                    >
                      {image && (
                        <img
                          src={image}
                          alt={product.title || 'Product watch'}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${blocked ? 'opacity-60' : ''}`}
                        />
                      )}
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        blocked
                          ? 'bg-rose-100 text-rose-800'
                          : outOfStock
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-900'
                      }`}>
                        {blocked ? 'Under review' : outOfStock ? 'Out of stock' : 'Available'}
                      </span>
                    </Link>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {product.brand || 'Your collection'}
                          </p>
                          <h2 className="mt-1 truncate font-serif text-lg font-semibold text-stone-950">
                            {product.title || 'Untitled watch'}
                          </h2>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-emerald-950">{formatPrice(product.price)}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-600">
                        <span className="truncate">{product.category || 'Uncategorized'}</span>
                        <span className={`shrink-0 font-medium ${outOfStock ? 'text-amber-800' : 'text-stone-700'}`}>
                          {Number(product.stock) || 0} in stock
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/edit-product/${product._id}`)}
                          className="min-h-10 rounded-xl border border-stone-300 px-3 text-xs font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950"
                        >
                          Edit listing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deleting}
                          className="min-h-10 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                      {blocked && (
                        <button
                          type="button"
                          onClick={() => handleContactSupport(product)}
                          className="mt-2 w-full rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                        >
                          Contact support about this listing
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
      </div>
    </div>
  );
}

SummaryCard.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};
