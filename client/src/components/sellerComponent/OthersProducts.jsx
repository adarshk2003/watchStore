import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const productsPerPage = 20;

export default function OthersProductList() {
  const [products, setProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login', { replace: true });
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/products/others`, {
          params: {
            page,
            limit: productsPerPage,
            q: searchQuery.trim() || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data?.data) || !response.data?.pagination) {
          throw new Error('The product response was not in the expected format.');
        }
        if (active) {
          setProducts(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (requestError) {
        console.error('Could not load products from other sellers:', requestError);
        if (active) setError(requestError.response?.data?.message || 'Could not load products. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }, searchQuery.trim() ? 250 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [navigate, page, searchQuery, token]);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };

    axios.get(`${API_BASE_URL}/viewWishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!active) return;
        const items = response.data?.items;
        setWishlistItems(Array.isArray(items)
          ? items.map((item) => item?.productId?._id || item?.productId).filter(Boolean)
          : []);
      })
      .catch((requestError) => {
        console.error('Error fetching wishlist:', requestError);
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="container mx-auto my-8 px-4">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-950">Browse other sellers&apos; products</h1>
          <p className="mt-1 text-sm text-stone-600">Search and browse available listings from the marketplace.</p>
        </div>
        <label className="w-full sm:max-w-sm">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-emerald-800"
            placeholder="Search title or category"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {loading && <p className="rounded-xl bg-white p-5 text-sm text-stone-600" role="status">Loading products...</p>}
      {error && <p className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-800" role="alert">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          No products found. Try a different search.
        </p>
      )}

      {!error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <article key={product._id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <button type="button" onClick={() => navigate(`/products/${product._id}`)} className="block w-full text-left">
                  <img
                    src={product.product_images?.[0] || '/images/default-image.png'}
                    alt={product.title}
                    className="h-40 w-full cursor-pointer bg-[#f1eee7] object-contain p-3"
                  />
                </button>
                <div className="p-4">
                  <h2 className="truncate text-base font-semibold capitalize text-stone-900">{product.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-stone-800">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                  <p className="mt-2 line-clamp-1 text-sm text-stone-600">{product.description}</p>
                  <p className="mt-2 text-xs capitalize text-stone-500">{product.category}</p>
                  {wishlistItems.includes(product._id) && <p className="mt-2 text-xs font-medium text-emerald-800">In wishlist</p>}
                </div>
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Marketplace product pages" className="mt-7 flex items-center justify-center gap-4">
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
        </>
      )}
    </section>
  );
}
