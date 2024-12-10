import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();
  const [isSeller, setIsSeller] = useState(false);

  const handleCheckboxChange = () => {
    setIsSeller(!isSeller);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSeller) {
      navigate('/seller-signup'); // Redirect to seller sign-up page
    } else {
      // Handle regular user sign up
    }
  };

  return (
    <>
      <div className="w-full h-screen flex items-start">
        <div className="relative w-full md:w-1/2 h-full hidden md:block">
          <img src="/cover_watch.jpg" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 h-full bg-neutral-300 flex flex-col p-14 justify-between items-center">
          <h1 className="font-mono text-3xl text-emerald-900 mr-auto">CLYRO</h1>

          <div className="w-full flex flex-col max-w-[430px]">
            <div className="flex flex-col w-full mb-2">
              <h3 className="text-2xl font-mono">Sign Up</h3>
              <p className="text-sm mb-2 font-mono">Create your account by entering your details</p>
            </div>

            <div className="w-full flex flex-col">
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
            </div>

            <div className="w-full flex items-center my-4">
              <input
                type="checkbox"
                id="isSeller"
                checked={isSeller}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="isSeller" className="text-sm font-mono">Sign up as a seller</label>
            </div>

            <div className="w-full flex flex-col my-5">
              <button type="submit" onClick={handleSubmit} className="my-2 w-full bg-slate-900 text-white rounded-md p-4 font-mono text-center hover:bg-emerald-900">
                Sign Up
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <p className="font-mono text-sm">Already have an account? <Link to="/login" className="font-mono hover:underline cursor-pointer hover:text-emerald-900">Log in</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
