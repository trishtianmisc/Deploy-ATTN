import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/Your paragraph text.png";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await axios.post("http://127.0.0.1:8000/api/account/", {
      FIRST_NAME: firstName,
      MIDDLE_NAME: middleName || null,
      LAST_NAME: lastName,
      USERNAME: username,
      DATE_OF_BIRTH: dob || null,
      PASSWORD: password,
    });

    alert("Account successfully registered!");
    navigate("/login");

  } catch (err) {
    console.error(err);

    // If the backend returns any 400/500 error, assume an account already exists
    if (err.response && (err.response.status === 400 || err.response.status === 500)) {
      setError(
        "You have already created an account. Please go to Edit Profile if changes are needed."
      );
    } else {
      setError("Registration failed. Please check your details.");
    }
  } finally {
    setLoading(false);
  }
};


  const inputClasses =
    "w-full mt-0.5 px-4 py-1 border border-[#d5b89c] rounded-lg focus:ring-2 focus:ring-[#F8961E]/30 focus:border-[#F8961E] text-black";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">

      {/* LEFT SIDE */}
      <div className="w-full md:w-[40%] flex flex-row md:flex-col items-center justify-center py-1 md:h-screen gap-4 bg-gradient-to-bl from-[#4D1C0A] via-[#F8961E] to-[#4D1C0A]">
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
      <div className="w-full md:w-[60%] flex items-center justify-center py-10 md:h-screen">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-2 border-[#F8961E]">

          <h2 className="text-3xl font-bold text-[#F8961E] text-center mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Fill in your details to get started
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* FIRST + LAST NAME */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            {/* MIDDLE NAME + DATE OF BIRTH */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle Name"
                  className={inputClasses}
                />
              </div>

              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            {/* USERNAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className={inputClasses}
              />
            </div>
<div className="relative w-full">
  <label className="text-sm font-medium text-gray-700">Password</label>
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
    required
    className="w-full mt-1 px-4 py-1.5 text-gray-700 pr-10 border border-[#d5b89c] rounded-lg focus:ring-2 focus:ring-[#F8961E]/30 focus:border-[#F8961E]"
  />
 <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-2 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-700"
>
  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
</button>
</div>




            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F8961E] text-white py-1.5 rounded-lg font-semibold hover:bg-[#a23207] transition-all disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#F8961E] font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
