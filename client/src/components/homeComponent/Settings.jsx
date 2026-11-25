import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaLock, FaMoon, FaStore } from 'react-icons/fa';
import PropTypes from 'prop-types';
import AccountLayout from './AccountLayout';

const roleLabels = {
  '67587113ae9c6b1dffa1a7ef': 'Customer',
  '675870f3ae9c6b1dffa1a7ee': 'Seller',
  '675870dbae9c6b1dffa1a7ed': 'Administrator',
};

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem('reduceMotion') === 'true'
  );
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      if (!token) {
        setError('Please sign in to manage your settings.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/userprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setUser(response.data.data);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'We could not load your account settings.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    localStorage.setItem('reduceMotion', String(reduceMotion));
    return () => {
      delete document.documentElement.dataset.reduceMotion;
    };
  }, [reduceMotion]);

  const userType = user?.user_type || localStorage.getItem('userType');
  const roleLabel = roleLabels[userType] || 'Customer';

  return (
    <AccountLayout activePage="settings" userType={userType}>
      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500" role="status">
          Loading your settings…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700" role="alert">
          {error}
          {!token && <Link to="/login" className="ml-2 font-semibold underline">Sign in</Link>}
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><FaLock aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-semibold">Sign-in & security</h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Reset your password using a one-time code sent to your registered email.
                </p>
                <p className="mt-3 text-sm font-medium text-stone-700">{user?.email}</p>
                <Link to="/forgot-password" className="mt-4 inline-flex rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Reset password
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><FaMoon aria-hidden="true" /></span>
              <div className="flex-1">
                <h2 className="font-serif text-xl font-semibold">Display</h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Reduce decorative transitions and motion on this device.
                </p>
                <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#f7f6f2] p-4">
                  <span className="text-sm font-medium text-stone-700">Reduce motion</span>
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(event) => setReduceMotion(event.target.checked)}
                    className="h-5 w-5 accent-emerald-900"
                  />
                </label>
                <p className="mt-3 text-xs text-stone-400">This preference is saved in this browser.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><FaBell aria-hidden="true" /></span>
              <div>
                <h2 className="font-serif text-xl font-semibold">Contact details</h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Your account email is <span className="font-medium text-stone-700">{user?.email}</span>. Update your name, email, or shipping address from your profile.
                </p>
                <Link to="/profile" className="mt-4 inline-flex rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950">
                  Edit profile
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-serif text-xl font-semibold">Your workspace</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Shortcuts for your {roleLabel.toLowerCase()} account.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {userType === '675870f3ae9c6b1dffa1a7ee' ? (
                <>
                  <WorkspaceLink to="/myproducts">My products</WorkspaceLink>
                  <WorkspaceLink to="/dashboard-seller">Sales dashboard</WorkspaceLink>
                  <WorkspaceLink to="/addproduct">Add a product</WorkspaceLink>
                </>
              ) : userType === '675870dbae9c6b1dffa1a7ed' ? (
                <>
                  <WorkspaceLink to="/admin-home">Admin dashboard</WorkspaceLink>
                  <WorkspaceLink to="/alluser">Manage users</WorkspaceLink>
                </>
              ) : (
                <>
                  <WorkspaceLink to="/orders">My orders</WorkspaceLink>
                  <WorkspaceLink to="/wishlist">Wishlist</WorkspaceLink>
                  <WorkspaceLink to="/shop">Explore watches</WorkspaceLink>
                </>
              )}
            </div>
          </section>

          {userType === '67587113ae9c6b1dffa1a7ef' && (
            <section id="seller-access" className="rounded-2xl border border-[#e7dfd0] bg-[#fbf9f4] p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className="rounded-xl bg-white p-3 text-emerald-900"><FaStore aria-hidden="true" /></span>
                <div className="flex-1">
                  <h2 className="font-serif text-xl font-semibold">Seller access</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Apply to list products in the Clyro marketplace. Seller access is reviewed by an administrator.
                  </p>
                  <SellerAccessForm token={token} />
                </div>
              </div>
            </section>
          )}

          <p className="px-1 text-xs text-stone-400">
            Account type: {roleLabel}. Preferences marked as device-specific are not synced to other devices.
          </p>
        </div>
      )}
    </AccountLayout>
  );
}

function SellerAccessForm({ token }) {
  const [companyName, setCompanyName] = useState('');
  const [license, setLicense] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitRequest = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!companyName.trim() || !license.trim()) {
      setError('Enter your company name and license details.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/requestUpgrade`,
        { companyName: companyName.trim(), license: license.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message || 'Seller access request submitted.');
      setCompanyName('');
      setLicense('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your seller access request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitRequest} className="mt-5 space-y-4">
      <label className="block text-sm font-medium text-stone-700">
        Company name
        <input
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        License or business details
        <textarea
          value={license}
          onChange={(event) => setLicense(event.target.value)}
          maxLength={1000}
          rows={3}
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
        />
      </label>
      {message && <p className="text-sm text-emerald-800" role="status">{message}</p>}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl border border-emerald-900 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950 hover:text-white disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Request seller access'}
      </button>
    </form>
  );
}

function WorkspaceLink({ children, to }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950"
    >
      {children}
    </Link>
  );
}

SellerAccessForm.propTypes = {
  token: PropTypes.string.isRequired,
};

WorkspaceLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
};

export default Settings;
