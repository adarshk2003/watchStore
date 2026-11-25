import { API_BASE_URL } from '../../config/api.js';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiBaseUrl = API_BASE_URL;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/forgot-password`, { email });
      setOtpRequested(true);
      setOtp('');
      toast.info(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not request a reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/reset-password`, {
        email,
        otp,
        password,
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-300 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 font-mono text-3xl text-emerald-900">CLYRO</h1>
        <h2 className="mb-2 text-2xl font-semibold">Reset your password</h2>
        <p className="mb-6 text-sm text-gray-600">
          We&apos;ll email you a one-time code that expires after 10 minutes.
        </p>

        <form onSubmit={otpRequested ? resetPassword : requestOtp}>
          <label className="mb-1 block text-sm font-medium" htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={otpRequested || loading}
            className="mb-4 w-full rounded border border-gray-300 p-3 disabled:bg-gray-100"
          />

          {otpRequested && (
            <>
              <label className="mb-1 block text-sm font-medium" htmlFor="reset-otp">Email code</label>
              <input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mb-4 w-full rounded border border-gray-300 p-3"
              />

              <label className="mb-1 block text-sm font-medium" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mb-4 w-full rounded border border-gray-300 p-3"
              />

              <label className="mb-1 block text-sm font-medium" htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mb-4 w-full rounded border border-gray-300 p-3"
              />
            </>
          )}

          {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-900 py-3 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : otpRequested ? 'Reset password' : 'Send reset code'}
          </button>
        </form>

        {otpRequested && (
          <button
            type="button"
            disabled={loading}
            onClick={requestOtp}
            className="mt-4 w-full text-sm text-emerald-900 hover:underline disabled:opacity-60"
          >
            Send a new code
          </button>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-emerald-900 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
