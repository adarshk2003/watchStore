import { API_BASE_URL } from '../../config/api.js';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addUser = async (event) => {
    event.preventDefault();

    const nameRegex = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{8,128}$/;

    setErrors({ name: '', email: '', password: '' });

    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Full name is required' }));
      return;
    } else if (!nameRegex.test(name.trim())) {
      setErrors((prev) => ({ ...prev, name: 'Enter a valid name (letters only)' }));
      return;
    }

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      return;
    } else if (!emailRegex.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    } else if (!passwordRegex.test(password)) {
      setErrors((prev) => ({ ...prev, password: 'Password must be between 8 and 128 characters' }));
      return;
    }

    const data = { name: name.trim(), email: email.trim().toLowerCase(), password };

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        const { token, _id, user_type, role } = response.data.data || {};
        if (!token || !_id) {
          throw new Error('Account created. Please sign in to continue.');
        }
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', _id);
        localStorage.setItem('userType', user_type);
        localStorage.setItem('role', role || 'buyer');
        toast.success('Account created successfully!');
        navigate('/home');
      } else {
        toast.error(response.data.message || 'Could not complete registration.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      if (error.response?.status === 409) {
        setErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }));
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
          alt="Luxury Clyro watch craftsmanship"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200 backdrop-blur-md">
            <FaShieldAlt className="text-emerald-300" /> Authorized Clyro Client
          </span>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Begin your journey with considered timepieces.
          </h2>
          <p className="mt-3 max-w-md text-sm text-stone-300 leading-relaxed">
            Create your account to unlock private collection previews, personalized order tracking, and expedited checkout.
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
              Create an account
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Enter your details below to register your personal account.
            </p>
          </div>

          <form onSubmit={addUser} className="mt-8 space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Full name
              </label>
              <div className="relative mt-2">
                <FaUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Eleanor Vance"
                  autoComplete="name"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50/50 py-3 pl-10 pr-4 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-emerald-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-900"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name}</p>}
            </div>

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
              {errors.email && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Password
              </label>
              <div className="relative mt-2">
                <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  value={password}
                  minLength={8}
                  maxLength={128}
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
              {errors.password && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.password}</p>}
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
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <FaArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Sign In link */}
          <div className="mt-8 border-t border-stone-100 pt-6 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-950 transition hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
