import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/images/Your paragraph text.png";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../utility/API_Url";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // If the user is already logged in, redirect automatically


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/login/`, {
        USERNAME: username,
        PASSWORD: password,
      });

      localStorage.setItem("user", JSON.stringify(response.data));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE */}
      <div className="w-full md:w-[40%] flex flex-row md:flex-col items-center justify-center py-1 md:h-screen gap-4 bg-gradient-to-bl from-[#C53B09] via-[#F8961E] to-[#C53B09]">
        <img
          src={Logo}
          alt="ATTN Logo"
          className="w-15 mt-2 md:w-34 h-15 md:h-34 object-cover mb-4 rounded-2xl"
        />
        <h1 className="text-white text-2xl md:text-4xl font-extrabold tracking-wide text-center leading-tight">
          ATTN<br />STORE
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[60%] flex items-center justify-center py-26.5 md:h-screen">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-2 border-[#F8961E]">
          <h2 className="text-3xl font-bold text-[#F8961E] text-center mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Sign in to access your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* USERNAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full mt-1 px-4 py-2 border border-[#d5b89c] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#F8961E]/30 focus:border-[#F8961E] transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="w-full mt-1 px-4 py-2 border border-[#d5b89c] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#F8961E]/30 focus:border-[#F8961E] transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute mt-4 right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <Eye size={23} /> : <EyeOff size={23} />}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F8961E] text-white py-2.5 rounded-lg font-semibold hover:bg-[#a23207] transition-all disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}

          {/* SIGNUP LINK */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-[#F8961E] font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
