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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setError((prev) => ({ ...prev, email: 'emailis required' }));
      return;
    } else if (!emailRegex.test(email)) {
      setError((prev) => ({ ...prev, email: 'invalid email address!' }));
      return;
    }

    if (!password) {
      setError((prev) => ({ ...prev, password: 'password required' }));
      return;
    } else if (password.length < 6) {
      setError((prev) => ({ ...prev, password: 'password must have at least 6 charater ' }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:7000/login', { email, password });
      console.log(response);
      const { token, user_type } = response.data.data;

      if (!response.data) {
        toast.error('login faild');
      } else {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', response.data.data._id);
        localStorage.setItem('userType', user_type);
        console.log(localStorage);
        toast.success("login successFul");
        console.log("login successFul");

        // navigation
        const storedUserType = localStorage.getItem('userType');
        if (storedUserType === '67587113ae9c6b1dffa1a7ef') {
          navigate('/home');
        } else if (storedUserType === '675870f3ae9c6b1dffa1a7ee') {
          navigate('/seller-home');
        } else if (storedUserType === '675870dbae9c6b1dffa1a7ed') {
          navigate('/admin-home');
        } else {
          alert("unknown usertype");
        }
      }
    } catch (error) {
      setError(err.response?.data?.error || 'Login Failed');
      toast.error('Login Failed');
    }
  }


  return (
    <div className="w-full h-screen flex items-start">
      <div className="relative w-full md:w-1/2 h-full hidden md:block">
        <img src="/cover_watch.jpg" alt="Cover" className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-1/2 h-full bg-neutral-300 flex flex-col p-14 justify-between items-center">
        <h1 className="font-mono text-3xl text-emerald-900 mr-auto">CLYRO</h1>
        <form onSubmit={handleLogin}>
          <div className="w-full flex flex-col max-w-[430px]">
            <div className="flex flex-col w-full mb-2">
              <h3 className="text-2xl font-mono">Login</h3>
              <p className="text-sm mb-2 font-mono">Welcome back! Enter your details below:</p>
            </div>
            <div className="w-full flex flex-col">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error.password && <p style={{ color: 'red' }}>{error.password}</p>}
            </div>
            <div className="w-full flex justify-between items-center">
              <p className="text-sm font-mono cursor-pointer hover:underline">Forgot password?</p>
            </div>

           
            <div className="w-full flex flex-col my-5">
              <button
                type="submit"
                className="my-2 w-full bg-slate-900 text-white rounded-md p-4 font-mono text-center hover:bg-emerald-900"
              >
                Login
              </button>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <p className="font-mono text-sm">
              Dont have an account?
              <Link to="/signup" className="font-mono hover:underline cursor-pointer hover:text-emerald-900">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
