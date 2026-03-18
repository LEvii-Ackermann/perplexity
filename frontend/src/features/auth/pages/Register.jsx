import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const {handleRegister} = useAuth()
  const navigate = useNavigate()

  // Two-way binding
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleRegister({
      email: formData.email,
      username: formData.username,
      password: formData.password
    })
    navigate("/login")
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      
      {/* Outer Gradient Border */}
      <div className="w-full max-w-md p-px rounded-2xl bg-linear-to-r from-orange-400/40 to-orange-600/40">
        
        {/* Inner Card */}
        <div className="bg-black rounded-2xl p-8">
          
          {/* Heading */}
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
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
                placeholder="Create a password"
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-800 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-medium text-black bg-linear-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition"
            >
              Register
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span className="text-orange-400 hover:underline cursor-pointer">
              <Link to="/login">Login</Link>
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;