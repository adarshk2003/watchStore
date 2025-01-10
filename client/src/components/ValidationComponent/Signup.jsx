import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';


function SignUp({ setUserName }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');
  const navigate = useNavigate();

  const addUser = async (event) => {
    event.preventDefault();
    console.log("REACHED HERE......:)");

    const nameRegex = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{6,}$/;

    setErrors({ name: '', email: '', password: '' });

    // Basic validation
    if (!name && !email && !password) {
        setErrors({
            name: "Name is required!",
            email: "Email is required!",
            password: "Password is required!"
        });
        return;
    }

    if (!name) {
        setErrors((prev) => ({ ...prev, name: "Name is required!" }));
        return;
    } else if (!nameRegex.test(name)) {
        setErrors((prev) => ({ ...prev, name: "Invalid name!" }));
        return;
    }

    if (!email) {
        setErrors((prev) => ({ ...prev, email: "Email is required!" }));
        return;
    } else if (!emailRegex.test(email)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email!" }));
        return;
    }

    if (!password) {
        setErrors((prev) => ({ ...prev, password: "Password required!" }));
        return;
    } else if (!passwordRegex.test(password)) {
        setErrors((prev) => ({ ...prev, password: "Password must contain 6 characters!" }));
        return;
    }

    const data = { name, email, password };
    console.log(data);

    // Fetching
    try {
      const response = await axios.post("http://localhost:7000/users", data, {
          headers: {
              'Content-Type': 'application/json'
          }
      });

      console.log(response);

      // Assuming response.data.has the necessary fields. Adjust if the structure is different.
      if (response.status === 201) {
          toast.success("Account created successfully!");
          navigate('/home');
      
      } else {
          toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Something went wrong");
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
          <form onSubmit={addUser}>

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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
              />
              {errors.name && <div id="name-err" style={{ color: 'red' }}>{errors.name}</div>}
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
                required
              />
              {errors.email && <div id="email-err" style={{ color: 'red' }}>{errors.email}</div>}

              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-black border-b border-black outline-none focus:outline-none py-2 bg-transparent my-2"
                required
              />
              {errors.password && <div id="pass-err" style={{ color: 'red' }}>{errors.password}</div>}

            </div>

            {/* <div className="w-full flex items-center my-4">
              <input
                type="checkbox"
                id="isSeller"
                checked={isSeller}
                onChange={() => setIsSeller(!isSeller)}
                className="mr-2"
              />
              <label htmlFor="seller" className="text-sm font-mono">Sign up as a seller</label>
            </div> */}

            <div className="w-full flex flex-col my-5">
              <button type="submit" className="my-2 w-full bg-slate-900 text-white rounded-md p-4 font-mono text-center hover:bg-emerald-900">
                Sign Up
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <p className="font-mono text-sm">Already have an account? <Link to="/login" className="font-mono hover:underline cursor-pointer hover:text-emerald-900">Log in</Link></p>
          </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUp;
