import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { googleAuth } from "../services/auth.api.js";

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

  const oAthGoogleLogin = async () => {
    googleAuth()
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleLogin({
      email: formData.identifier,
      password: formData.password
    })

    navigate("/")

  };

  if(!loading && user){
    return <Navigate to="/" replace />
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
              className="w-full py-2 rounded-lg font-medium text-black bg-linear-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 cursor-pointer transition"
            >
              Login
            </button>
          </form>

          <button
            onClick={oAthGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              height: "42px",
              marginTop: "16px",
              background: "#fff",
              border: "1px solid #dadce0",
              borderRadius: "8px",
              fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#3c4043",
              letterSpacing: "0.25px",
              cursor: "pointer",
              boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

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