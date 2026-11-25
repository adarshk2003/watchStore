import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  FaBan,
  FaCheck,
  FaEye,
  FaSearch,
  FaStore,
  FaTrash,
  FaUnlockAlt,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import NavAdmin from './AdminNav';

const CUSTOMER_ROLE = '67587113ae9c6b1dffa1a7ef';
const SELLER_ROLE = '675870f3ae9c6b1dffa1a7ee';
const ADMIN_ROLE = '675870dbae9c6b1dffa1a7ed';

const roleName = (user) => {
  const roleId = typeof user.user_type === 'string' ? user.user_type : user.user_type?._id;
  if (roleId === CUSTOMER_ROLE) return 'Customer';
  if (roleId === SELLER_ROLE) return 'Seller';
  if (roleId === ADMIN_ROLE) return 'Admin';
  return 'User';
};

const headersFor = (token) => ({ Authorization: `bearer ${token}` });

export default function Allusers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userMetrics, setUserMetrics] = useState({ total: 0, sellers: 0, customers: 0, blocked: 0 });
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [requestsError, setRequestsError] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let active = true;
    if (!token) {
      navigate('/login', { replace: true });
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      setLoadingUsers(true);
      setUsersError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: headersFor(token),
          params: {
            page: userPage,
            limit: 25,
            q: searchQuery.trim() || undefined,
            role: roleFilter,
            status: statusFilter,
          },
        });
        const data = response.data?.data;
        const pagination = response.data?.pagination;
        if (!Array.isArray(data) || !pagination) {
          throw new Error('The account directory response was not in the expected format.');
        }
        if (active) {
          setUsers(data);
          setUserMetrics(response.data.summary || { total: 0, sellers: 0, customers: 0, blocked: 0 });
          setUserTotalPages(pagination.totalPages);
          setUserTotalItems(pagination.totalItems);
        }
      } catch (requestError) {
        console.error('Could not load user accounts:', requestError);
        if (active) {
          setUsersError(requestError.response?.data?.message || 'We could not load user accounts. Please try again.');
        }
      } finally {
        if (active) setLoadingUsers(false);
      }
    }, searchQuery.trim() ? 250 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [navigate, refreshKey, token, userPage, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };

    setLoadingRequests(true);
    setRequestsError('');
    axios.get(`${API_BASE_URL}/upgradeRequests`, { headers: headersFor(token) })
      .then((response) => {
        if (active && Array.isArray(response.data?.data)) setUpgradeRequests(response.data.data);
      })
      .catch((requestError) => {
        console.error('Could not load seller applications:', requestError);
        if (active) setRequestsError(requestError.response?.data?.message || 'Seller applications could not be loaded.');
      })
      .finally(() => {
        if (active) setLoadingRequests(false);
      });

    return () => { active = false; };
  }, [refreshKey, token]);

  const visibleUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const role = roleName(user).toLowerCase();
      const searchable = [user.name, user.email, role].some(
        (value) => String(value || '').toLowerCase().includes(query)
      );
      const roleMatches = roleFilter === 'all' || role === roleFilter;
      const statusMatches = statusFilter === 'all' ||
        (statusFilter === 'blocked' && user.isBlocked) ||
        (statusFilter === 'active' && !user.isBlocked);
      return role !== 'admin' && searchable && roleMatches && statusMatches;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const handleUserStatus = async (user) => {
    const shouldBlock = !user.isBlocked;
    const action = shouldBlock ? 'block' : 'unblock';
    const message = shouldBlock
      ? `Block ${user.name || 'this user'}? They will lose access to their account.`
      : `Unblock ${user.name || 'this user'}?`;
    if (!window.confirm(message)) return;

    const actionKey = `user:${user._id}`;
    setPendingAction(actionKey);
    try {
      await axios.post(
        `${API_BASE_URL}/${shouldBlock ? 'block' : 'unblock'}`,
        { userId: user._id },
        { headers: headersFor(token) }
      );
      setUsers((current) => current.map((item) => (
        item._id === user._id ? { ...item, isBlocked: shouldBlock } : item
      )));
      setUserMetrics((current) => ({
        ...current,
        blocked: current.blocked + (shouldBlock ? 1 : -1),
      }));
      setRefreshKey((key) => key + 1);
      toast.success(`Account ${shouldBlock ? 'blocked' : 'unblocked'}.`);
    } catch (requestError) {
      console.error(`Could not ${action} account:`, requestError);
      toast.error(requestError.response?.data?.message || `Could not ${action} this account.`);
    } finally {
      setPendingAction('');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name || user.email || 'this account'}? This cannot be undone.`)) {
      return;
    }

    setPendingAction(`user:${user._id}`);
    try {
      const response = await axios.delete(`${API_BASE_URL}/user/${user._id}`, {
        headers: headersFor(token),
      });
      setUsers((current) => current.filter((item) => item._id !== user._id));
      const nextTotalItems = Math.max(0, userTotalItems - 1);
      setUserTotalItems(nextTotalItems);
      setUserTotalPages(Math.ceil(nextTotalItems / 25));
      setUserMetrics((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        sellers: Math.max(0, current.sellers - (roleName(user) === 'Seller' ? 1 : 0)),
        customers: Math.max(0, current.customers - (roleName(user) === 'Customer' ? 1 : 0)),
        blocked: Math.max(0, current.blocked - (user.isBlocked ? 1 : 0)),
      }));
      if (users.length === 1 && userPage > 1) setUserPage((current) => current - 1);
      else setRefreshKey((key) => key + 1);
      toast.success(response.data?.message || 'Account deleted.');
    } catch (requestError) {
      console.error('Could not delete user account:', requestError);
      toast.error(requestError.response?.data?.message || 'Could not delete this account.');
    } finally {
      setPendingAction('');
    }
  };

  const handleUpgradeRequest = async (request, approve) => {
    const action = approve ? 'approve' : 'reject';
    setPendingAction(`request:${request._id}`);
    try {
      if (approve) {
        await axios.put(
          `${API_BASE_URL}/approveUpgrade/${request._id}`,
          {},
          { headers: headersFor(token) }
        );
        setUsers((current) => current.map((user) => (
          user._id === (request.userId?._id || request.userId)
            ? { ...user, user_type: SELLER_ROLE }
            : user
        )));
        const applicant = users.find((user) => user._id === (request.userId?._id || request.userId));
        if (applicant && roleName(applicant) === 'Customer') {
          setUserMetrics((current) => ({
            ...current,
            sellers: current.sellers + 1,
            customers: Math.max(0, current.customers - 1),
          }));
        }
      } else {
        await axios.delete(`${API_BASE_URL}/rejectUpgrade/${request._id}`, {
          headers: headersFor(token),
        });
      }
      setUpgradeRequests((current) => current.filter((item) => item._id !== request._id));
      if (approve) setRefreshKey((key) => key + 1);
      toast.success(`Seller application ${approve ? 'approved' : 'rejected'}.`);
    } catch (requestError) {
      console.error(`Could not ${action} seller application:`, requestError);
      toast.error(requestError.response?.data?.message || `Could not ${action} this application.`);
    } finally {
      setPendingAction('');
    }
  };

  return (
    <>
      <NavAdmin />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Clyro administration</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">People & applications</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                Review seller applications and manage customer and seller accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="w-fit rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950"
            >
              Refresh data
            </button>
          </div>

          <section aria-label="Account summary" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={<FaUsers aria-hidden="true" />} label="Managed accounts" value={userMetrics.total} />
            <SummaryCard icon={<FaStore aria-hidden="true" />} label="Sellers" value={userMetrics.sellers} />
            <SummaryCard icon={<FaUser aria-hidden="true" />} label="Customers" value={userMetrics.customers} />
            <SummaryCard icon={<FaBan aria-hidden="true" />} label="Blocked accounts" value={userMetrics.blocked} />
          </section>

          <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">Seller onboarding</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-950">Seller applications</h2>
              </div>
              {!loadingRequests && !requestsError && (
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                  {upgradeRequests.length} awaiting review
                </span>
              )}
            </div>

            {loadingRequests ? (
              <LoadingMessage text="Loading seller applications…" />
            ) : requestsError ? (
              <InlineError message={requestsError} onRetry={() => setRefreshKey((key) => key + 1)} />
            ) : upgradeRequests.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#f7f6f2] p-4 text-sm text-stone-600">There are no seller applications waiting for review.</p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {upgradeRequests.map((request) => {
                  const requester = request.userId && typeof request.userId === 'object'
                    ? request.userId
                    : {};
                  const isPending = pendingAction === `request:${request._id}`;
                  return (
                    <article key={request._id} className="rounded-xl border border-stone-200 bg-[#fbfaf7] p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-stone-950">{requester.name || 'Applicant'}</h3>
                          <p className="mt-1 text-xs text-stone-500">{requester.email || 'Email not provided'}</p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">Pending</span>
                      </div>
                      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-stone-500">Business</dt>
                          <dd className="mt-0.5 font-medium text-stone-800">{request.companyName || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-stone-500">License</dt>
                          <dd className="mt-0.5 break-all font-medium text-stone-800">{request.license || 'Not provided'}</dd>
                        </div>
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleUpgradeRequest(request, true)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-950 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-50"
                        >
                          <FaCheck aria-hidden="true" /> Approve seller
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleUpgradeRequest(request, false)}
                          className="min-h-10 rounded-xl border border-stone-300 px-4 text-xs font-semibold text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 disabled:cursor-wait disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">Account directory</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-950">Customers and sellers</h2>
              </div>
              <span className="text-sm text-stone-500">
                {loadingUsers ? 'Loading accounts…' : `${userTotalItems} ${userTotalItems === 1 ? 'account' : 'accounts'}`}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="relative">
                  <FaSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => { setSearchQuery(event.target.value); setUserPage(1); }}
                    placeholder="Search name, email, or role"
                    aria-label="Search accounts"
                    className="min-h-11 w-full rounded-xl border border-stone-200 bg-[#fbfaf7] pl-11 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
                  />
                </div>
                <label className="sr-only" htmlFor="role-filter">Filter by role</label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(event) => { setRoleFilter(event.target.value); setUserPage(1); }}
                  className="min-h-11 rounded-xl border border-stone-200 bg-[#fbfaf7] px-4 text-sm text-stone-700 outline-none focus:border-emerald-800"
                >
                  <option value="all">All roles</option>
                  <option value="customer">Customers</option>
                  <option value="seller">Sellers</option>
                </select>
                <label className="sr-only" htmlFor="status-filter">Filter by account status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => { setStatusFilter(event.target.value); setUserPage(1); }}
                  className="min-h-11 rounded-xl border border-stone-200 bg-[#fbfaf7] px-4 text-sm text-stone-700 outline-none focus:border-emerald-800"
                >
                  <option value="all">All account statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {loadingUsers ? (
              <LoadingMessage text="Loading accounts…" />
            ) : usersError ? (
              <InlineError message={usersError} onRetry={() => setRefreshKey((key) => key + 1)} />
            ) : visibleUsers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
                <h3 className="font-serif text-xl font-semibold text-stone-950">No accounts found</h3>
                <p className="mt-2 text-sm text-stone-600">Try a different search or change the filters.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="divide-y divide-stone-100">
                  {visibleUsers.map((user) => {
                    const isPending = pendingAction === `user:${user._id}`;
                    const role = roleName(user);
                    return (
                      <article key={user._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-serif font-semibold text-emerald-950">
                            {String(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-stone-950">{user.name || 'Unnamed account'}</h3>
                            <p className="mt-0.5 truncate text-xs text-stone-500">{user.email || 'No email address'}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700">{role}</span>
                          <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                            user.isBlocked ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-900'
                          }`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/user/${user._id}`)}
                            aria-label={`View ${user.name || 'user'} account`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:border-emerald-800 hover:text-emerald-950"
                          >
                            <FaEye aria-hidden="true" size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUserStatus(user)}
                            disabled={isPending}
                            aria-label={`${user.isBlocked ? 'Unblock' : 'Block'} ${user.name || 'user'}`}
                            className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                              user.isBlocked
                                ? 'border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                                : 'border-amber-200 text-amber-900 hover:bg-amber-50'
                            }`}
                          >
                            {user.isBlocked ? <FaUnlockAlt aria-hidden="true" /> : <FaBan aria-hidden="true" />}
                            <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isPending}
                            aria-label={`Delete ${user.name || 'user'} account`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                          >
                            <FaTrash aria-hidden="true" size={12} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
            {!loadingUsers && !usersError && userTotalPages > 1 && (
              <nav aria-label="Account directory pages" className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setUserPage((current) => Math.max(1, current - 1))}
                  disabled={userPage === 1}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-stone-600">Page {userPage} of {userTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setUserPage((current) => Math.min(userTotalPages, current + 1))}
                  disabled={userPage === userTotalPages}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">{icon}</span>
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-stone-950">{value.toLocaleString('en-IN')}</p>
      </div>
    </article>
  );
}

SummaryCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

function LoadingMessage({ text }) {
  return (
    <div className="flex min-h-32 items-center justify-center" role="status">
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

function InlineError({ message, onRetry }) {
  return (
    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p role="alert">{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 font-semibold underline underline-offset-4">
        Try again
      </button>
    </div>
  );
}

InlineError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};
