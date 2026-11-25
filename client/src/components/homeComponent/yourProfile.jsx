import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaMapMarkerAlt, FaRegCalendarAlt, FaStore, FaUser } from 'react-icons/fa';
import AccountLayout from './AccountLayout';

const roleLabels = {
  '67587113ae9c6b1dffa1a7ef': 'Customer',
  '675870f3ae9c6b1dffa1a7ee': 'Seller',
  '675870dbae9c6b1dffa1a7ed': 'Administrator',
};

function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!token) {
        setError('Please sign in to view your account.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/userprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        const profile = response.data.data;
        setUser(profile);
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          address: profile.address || '',
        });
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'We could not load your profile. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [token]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const address = form.address.trim();
    if (!name || name.length > 100) {
      setError('Enter a name between 1 and 100 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/updateUser`,
        { name, email, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.data);
      setForm({
        name: response.data.data.name || '',
        email: response.data.data.email || '',
        address: response.data.data.address || '',
      });
      setIsEditing(false);
      setSuccess('Your profile was updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AccountLayout activePage="profile" userType={localStorage.getItem('userType')}>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500" role="status">
          Loading your profile…
        </div>
      </AccountLayout>
    );
  }

  if (!user) {
    return (
      <AccountLayout activePage="profile" userType={localStorage.getItem('userType')}>
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700" role="alert">
          {error}
          <Link to="/login" className="ml-2 font-semibold underline">Sign in</Link>
        </div>
      </AccountLayout>
    );
  }

  const role = roleLabels[user.user_type] || 'Customer';
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <AccountLayout activePage="profile" userType={user.user_type}>
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-700 sm:h-44" />
        <div className="px-5 pb-7 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#d6c6a5] font-serif text-3xl font-semibold text-emerald-950 shadow-sm sm:h-28 sm:w-28">
                {initials || <FaUser aria-hidden="true" />}
              </div>
              <div className="pb-1">
                <h2 className="font-serif text-2xl font-semibold text-stone-950">{user.name}</h2>
                <p className="mt-1 text-sm text-stone-500">{role} account</p>
              </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => { setSuccess(''); setError(''); setIsEditing(true); }}
                className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Edit profile
              </button>
            )}
          </div>

          {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          {success && <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{success}</p>}

          {isEditing ? (
            <form onSubmit={saveProfile} className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength={100}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="text-sm font-medium text-stone-700">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="text-sm font-medium text-stone-700 md:col-span-2">
                Shipping address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ name: user.name || '', email: user.email || '', address: user.address || '' });
                    setIsEditing(false);
                    setError('');
                  }}
                  className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl bg-[#f7f6f2] p-5">
                <FaEnvelope className="mt-1 text-emerald-900" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Email address</p>
                  <p className="mt-2 break-all text-sm font-medium text-stone-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl bg-[#f7f6f2] p-5">
                <FaMapMarkerAlt className="mt-1 text-emerald-900" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Shipping address</p>
                  <p className="mt-2 text-sm font-medium text-stone-800">{user.address || 'Add an address for faster checkout.'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl bg-[#f7f6f2] p-5">
                <FaStore className="mt-1 text-emerald-900" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Account type</p>
                  <p className="mt-2 text-sm font-medium text-stone-800">{role}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl bg-[#f7f6f2] p-5">
                <FaRegCalendarAlt className="mt-1 text-emerald-900" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Member since</p>
                  <p className="mt-2 text-sm font-medium text-stone-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Clyro member'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {user.user_type === '67587113ae9c6b1dffa1a7ef' && (
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#e7dfd0] bg-[#fbf9f4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-900">Interested in selling?</h3>
                <p className="mt-1 text-sm text-stone-500">Submit your details for seller account review.</p>
              </div>
              <Link to="/settings#seller-access" className="shrink-0 rounded-xl border border-emerald-900 px-4 py-3 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950 hover:text-white">
                Seller access
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}

export default Profile;
