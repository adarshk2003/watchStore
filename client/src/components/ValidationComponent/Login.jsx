import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError({ email: '', password: '' });

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setError((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    } else if (!emailRegex.test(email)) {
      setError((prev) => ({ ...prev, email: 'Invalid email address!' }));
      return;
    }

    if (!password) {
      setError((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    } else if (password.length < 6) {
      setError((prev) => ({ ...prev, password: 'Password must have at least 6 characters' }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:7000/login', { email, password });

      const { token, user_type, isBlocked } = response.data.data;

      if (isBlocked) {
        navigate('/blockeduser');
        return;
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', response.data.data._id);
      localStorage.setItem('userType', user_type);

      toast.success('Login successful!');

      // Role-based navigation
      switch (user_type) {
        case '67587113ae9c6b1dffa1a7ef': // Customer
          navigate('/home');
          break;
        case '675870f3ae9c6b1dffa1a7ee': // Seller
          navigate('/seller-home');
          break;
        case '675870dbae9c6b1dffa1a7ed': // Admin
          navigate('/admin-home');
          break;
        default:
          alert('Unknown user type');
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/blockeduser');
      } else {
        setError((prev) => ({ ...prev, email: error.response?.data?.message || 'Login failed' }));
        toast.error('Login failed');
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Image Section */}
      <div className="hidden md:flex w-full md:w-1/2 h-full">
        <img
          src="/cover_watch.jpg"
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Login Form */}
      <div className="flex w-full md:w-1/2 h-full bg-neutral-300 p-8 items-center justify-center">
        <div className="max-w-md w-full">
          <h1 className="font-mono text-3xl text-emerald-900 mb-6">CLYRO</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <h3 className="text-2xl font-mono">Login</h3>
              <p className="text-sm font-mono">Welcome back! Enter your details below:</p>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="w-full text-black border-b rounded-sm border-black outline-none py-2 bg-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                className="w-full text-black border-b rounded-sm border-black outline-none  py-2 bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center mb-4">
              <Link to="/forgot-password" className="text-sm font-mono hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-emerald-900 text-white rounded-md py-2 hover:bg-emerald-700 hover:rounded-xl"
            >
              Login
            </button>
          </form>

          {/* Sign Up */}
          <p className="text-center mt-4 text-sm font-mono">
            Don't have an account?{' '}
            <Link to="/signup" className="hover:underline text-emerald-900">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
