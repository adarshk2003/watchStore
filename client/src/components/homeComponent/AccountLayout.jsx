import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCog, FaUser } from 'react-icons/fa';
import PropTypes from 'prop-types';

const roleDetails = {
  '67587113ae9c6b1dffa1a7ef': {
    label: 'Customer account',
    workspace: 'home',
    workspaceLabel: 'Continue shopping',
  },
  '675870f3ae9c6b1dffa1a7ee': {
    label: 'Seller account',
    workspace: 'seller-home',
    workspaceLabel: 'Seller workspace',
  },
  '675870dbae9c6b1dffa1a7ed': {
    label: 'Administrator account',
    workspace: 'admin-home',
    workspaceLabel: 'Admin dashboard',
  },
};

function AccountLayout({ children, activePage, userType }) {
  const navigate = useNavigate();
  const role = roleDetails[userType] || roleDetails['67587113ae9c6b1dffa1a7ef'];

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    navigate('/login', { replace: true });
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-900 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-950'
    }`;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={role.workspace} className="font-serif text-2xl font-bold tracking-[0.16em] text-emerald-950">
            CLYRO
          </Link>
          <Link
            to={role.workspace}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950"
          >
            <FaArrowLeft aria-hidden="true" />
            <span className="hidden sm:inline">{role.workspaceLabel}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <aside>
          <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
            <p className="px-4 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              {role.label}
            </p>
            <nav aria-label="Account navigation" className="space-y-1">
              <NavLink to="/profile" end className={navClass}>
                <FaUser aria-hidden="true" />
                Profile
              </NavLink>
              <NavLink to="/settings" className={navClass}>
                <FaCog aria-hidden="true" />
                Settings
              </NavLink>
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-500 transition hover:bg-white hover:text-red-700"
          >
            Sign out
          </button>
        </aside>

        <main>
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">Account center</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              {activePage === 'profile' ? 'Your profile' : 'Account settings'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              {activePage === 'profile'
                ? 'Keep your contact details current and manage your Clyro account.'
                : 'Manage your security and personal display preferences.'}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AccountLayout;

AccountLayout.propTypes = {
  children: PropTypes.node.isRequired,
  activePage: PropTypes.oneOf(['profile', 'settings']).isRequired,
  userType: PropTypes.string,
};
