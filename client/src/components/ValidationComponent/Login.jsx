import React from 'react';
import { Link } from 'react-router-dom';

function LoginForm() {
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
              <h3 className="text-2xl font-mono">Login</h3>
              <p className="text-sm mb-2 font-mono">welcome back! enter your details</p>
            </div>

            <div className="w-full flex flex-col">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="email"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="password"
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
            </div>

            <div className="w-full flex justify-between items-center">
              <p className="text-sm font-mono cursor-pointer hover:underline whitespace-nowrap">forgot password</p>
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
            <p className="font-mono text-sm">don't have an account? <Link to="/signup" className="font-mono hover:underline cursor-pointer hover:text-emerald-900">sign up</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
