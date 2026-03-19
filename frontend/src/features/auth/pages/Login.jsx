import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const user = useSelector(state => state.auth?.user)
  const loading = useSelector(state => state.auth?.loading)

  const {handleLogin} = useAuth()
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleLogin({
      email: formData.identifier,
      password: formData.password
    })

    navigate("/")

  };

  if(!loading && user){
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      
      {/* Card */}
      <div className="w-full max-w-md p-px rounded-2xl bg-linear-to-r from-orange-400/40 to-orange-600/40">
        
        <div className="bg-black rounded-2xl p-8">
          
          {/* Heading */}
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username / Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter username or email"
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-medium text-black bg-linear-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <span className="text-orange-400 hover:underline cursor-pointer">
              <Link to="/register">Register</Link>
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;