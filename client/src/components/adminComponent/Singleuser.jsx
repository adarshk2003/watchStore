import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaArrowLeft, FaBan, FaEye, FaUnlockAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavAdminCommon from './NavAdminCommon';

const SELLER_ROLE = '675870f3ae9c6b1dffa1a7ee';
const roleName = (role) => {
  const roleId = typeof role === 'string' ? role : role?._id;
  if (roleId === SELLER_ROLE) return 'Seller';
  if (roleId === '675870dbae9c6b1dffa1a7ed') return 'Admin';
  return 'Customer';
};

export default function SingleUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [pendingProduct, setPendingProduct] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;
    if (!token) {
      navigate('/login', { replace: true });
      return () => { active = false; };
    }

    const fetchUser = async () => {
      setLoadingUser(true);
      setError('');
      setProductsError('');
      setUser(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/${id}`, {
          headers: { Authorization: `bearer ${token}` },
        });
        const userData = Array.isArray(response.data?.data)
          ? response.data.data[0]
          : response.data?.data;
        if (!userData) throw new Error('This account could not be found.');
        if (active) setUser(userData);
      } catch (requestError) {
        console.error('Could not load user account:', requestError);
        if (active) {
          setError(requestError.response?.data?.message || requestError.message || 'Could not load this account.');
        }
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    fetchUser();
    return () => { active = false; };
  }, [id, navigate, refreshKey, token]);

  useEffect(() => {
    let active = true;
    if (!user || roleName(user.user_type) !== 'Seller') {
      setUserProducts([]);
      setLoadingProducts(false);
      return () => { active = false; };
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/products/seller/${id}`, {
          headers: { Authorization: `bearer ${token}` },
        });
        const products = response.data?.data;
        if (active) setUserProducts(Array.isArray(products) ? products : []);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          if (active) setUserProducts([]);
        } else {
          console.error('Could not load seller listings:', requestError);
          if (active) setProductsError(requestError.response?.data?.message || 'Could not load this seller’s listings.');
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => { active = false; };
  }, [id, token, user]);

  const handleToggleProduct = async (product) => {
    const shouldUnblock = Boolean(product.isStatus);
    const action = shouldUnblock ? 'unblock' : 'block';
    if (!window.confirm(`${shouldUnblock ? 'Restore' : 'Block'} “${product.title || 'this listing'}”?`)) return;

    setPendingProduct(product._id);
    try {
      await axios.post(
        `${API_BASE_URL}/${shouldUnblock ? 'unblockP' : 'blockP'}`,
        { productId: product._id },
        { headers: { Authorization: `bearer ${token}` } }
      );
      setUserProducts((current) => current.map((item) => (
        item._id === product._id ? { ...item, isStatus: !shouldUnblock } : item
      )));
      toast.success(`Listing ${shouldUnblock ? 'restored' : 'blocked'}.`);
    } catch (requestError) {
      console.error(`Could not ${action} seller listing:`, requestError);
      toast.error(requestError.response?.data?.message || `Could not ${action} this listing.`);
    } finally {
      setPendingProduct('');
    }
  };

  const userRole = user ? roleName(user.user_type) : '';

  return (
    <>
      <NavAdminCommon />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <Link to="/alluser" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
            <FaArrowLeft aria-hidden="true" size={12} /> Back to people
          </Link>

          {loadingUser ? (
            <LoadingMessage text="Loading account details…" />
          ) : error ? (
            <div className="mt-7 rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-800">
              <p role="alert">{error}</p>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="mt-3 font-semibold underline underline-offset-4">
                Try again
              </button>
            </div>
          ) : user && (
            <>
              <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="bg-emerald-950 px-6 py-7 text-white sm:px-9 sm:py-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Account overview</p>
                  <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 font-serif text-2xl font-semibold text-white">
                        {user.image ? (
                          <img src={user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          String(user.name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </span>
                      <div className="min-w-0">
                        <h1 className="truncate font-serif text-3xl font-semibold">{user.name || 'Unnamed account'}</h1>
                        <p className="mt-1 truncate text-sm text-emerald-100">{user.email || 'No email address'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{userRole}</span>
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        user.isBlocked ? 'bg-rose-200 text-rose-950' : 'bg-emerald-200 text-emerald-950'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                  <AccountDetail label="Full name" value={user.name || ''} />
                  <AccountDetail label="Email address" value={user.email || ''} />
                  <AccountDetail label="Account type" value={userRole} />
                  <AccountDetail label="Delivery address" value={user.address || ''} />
                  <AccountDetail
                    label="Joined"
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) : 'Not available'}
                  />
                </div>
              </section>

              {userRole === 'Seller' && (
                <section className="mt-8">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Seller inventory</p>
                      <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-950">Listings by {user.name || 'seller'}</h2>
                    </div>
                    {!loadingProducts && !productsError && (
                      <span className="text-sm text-stone-500">{userProducts.length} listings</span>
                    )}
                  </div>

                  {loadingProducts ? (
                    <LoadingMessage text="Loading seller listings…" />
                  ) : productsError ? (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-800" role="alert">{productsError}</div>
                  ) : userProducts.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">This seller has no listings yet.</p>
                  ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {userProducts.map((product) => {
                        const image = Array.isArray(product.product_images)
                          ? product.product_images[0]
                          : product.product_images;
                        const pending = pendingProduct === product._id;
                        return (
                          <article key={product._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            <div className="relative aspect-[4/3] bg-stone-100">
                              {image && (
                                <img src={image} alt={product.title || 'Seller watch'} loading="lazy" className="h-full w-full object-cover" />
                              )}
                              <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                product.isStatus ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-900'
                              }`}>
                                {product.isStatus ? 'Blocked' : 'Visible'}
                              </span>
                            </div>
                            <div className="p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{product.brand || 'Watch'}</p>
                              <h3 className="mt-1 truncate font-serif text-lg font-semibold text-stone-950">{product.title || 'Untitled listing'}</h3>
                              <p className="mt-2 text-sm font-semibold text-emerald-950">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/products/${product._id}`)}
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950"
                                >
                                  <FaEye aria-hidden="true" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleProduct(product)}
                                  disabled={pending}
                                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                                    product.isStatus
                                      ? 'border border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                                      : 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                                  }`}
                                >
                                  {product.isStatus ? <FaUnlockAlt aria-hidden="true" /> : <FaBan aria-hidden="true" />}
                                  {product.isStatus ? 'Restore' : 'Block'}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

function AccountDetail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-stone-900">{value || 'Not provided'}</p>
    </div>
  );
}

AccountDetail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

function LoadingMessage({ text }) {
  return (
    <div className="flex min-h-48 items-center justify-center" role="status">
      <div className="flex items-center gap-3 text-sm text-stone-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
        {text}
      </div>
    </div>
  );
}

LoadingMessage.propTypes = {
  text: PropTypes.string.isRequired,
};
