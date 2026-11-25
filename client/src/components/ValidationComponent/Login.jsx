import { API_BASE_URL } from '../../config/api.js';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaClock, FaArrowRight } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError({ email: '', password: '' });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setError((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    } else if (!emailRegex.test(email)) {
      setError((prev) => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }

    if (!password) {
      setError((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    } else if (password.length < 6) {
      setError((prev) => ({ ...prev, password: 'Password must have at least 6 characters' }));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

      const { token, user_type, role, isBlocked } = response.data.data;

      if (isBlocked) {
        navigate('/blockeduser');
        return;
      }

      const normalizedRole = role || (
        user_type === '675870dbae9c6b1dffa1a7ed' ? 'admin' :
        user_type === '675870f3ae9c6b1dffa1a7ee' ? 'seller' : 'buyer'
      );

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', response.data.data._id);
      localStorage.setItem('userType', user_type);
      localStorage.setItem('role', normalizedRole);

      toast.success('Welcome back!');

      if (normalizedRole === 'admin') {
        navigate('/admin-home');
      } else if (normalizedRole === 'seller') {
        navigate('/seller-home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate('/blockeduser');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password';
        setError((prev) => ({ ...prev, email: msg }));
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fbfaf7]">
      {/* Left Luxury Imagery */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/cover_watch.jpg"
          alt="Luxury Clyro watch"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200 backdrop-blur-md">
            <FaClock className="text-emerald-300" /> Clyro Haute Horlogerie
          </span>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Time, thoughtfully chosen for every moment.
          </h2>
          <p className="mt-3 max-w-md text-sm text-stone-300 leading-relaxed">
            Access your curated wishlist, past purchases, and verified luxury timepiece orders.
          </p>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex w-full items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950 font-serif text-lg font-bold text-white shadow-xs">
              C
            </span>
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-emerald-950">
              CLYRO
            </span>
          </div>

          <div className="mt-8">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Email address
              </label>
              <div className="relative mt-2">
                <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50/50 py-3 pl-10 pr-4 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-emerald-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-900"
                />
              </div>
              {error.email && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-900 transition hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50/50 py-3 pl-10 pr-11 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-emerald-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {error.password && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <FaArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-8 border-t border-stone-100 pt-6 text-center text-sm text-stone-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-emerald-950 transition hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
