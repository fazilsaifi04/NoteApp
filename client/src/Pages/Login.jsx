import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import instance from "../api/api"; 
import logo from "../assets/top.png";
import rightImg from "../assets/right-column.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [showOTPField, setShowOTPField] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!formData.email) {
      alert("Please enter your email.");
      return;
    }

    setShowOTPField(true); 
    setSendingOtp(true); 

    try {
      await instance.post("/auth/send-otp", {
        email: formData.email,
      });
      alert("OTP sent to your email!");
    } catch (err) {
      console.error("Error sending OTP:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, otp } = formData;
    if (!email || !otp) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await instance.post("/auth/verify-otp", {
        email,
        otp,
      });

      alert("Login successful!");

      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error verifying OTP:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center px-4 py-6 md:px-10 relative">
      <div className="w-full max-w-[1440px] h-full flex flex-col md:flex-row rounded-[32px] border border-gray-200 overflow-hidden shadow-md relative">
        {/* Top logo */}
        <div className="absolute top-8 left-8 flex items-center space-x-3 z-10">
          <img src={logo} alt="Logo" className="w-320 h-79" />
        </div>

        {/* Left Panel */}
        <div className="w-full md:w-[520px] h-full flex flex-col justify-center px-6 md:px-[48px] py-6 bg-white">
          <div className="flex flex-col space-y-6 justify-center">
            <div className="space-y-2">
              <h2 className="text-[32px] font-bold text-gray-900 leading-tight">
                Sign in
              </h2>
              <p className="text-[16px] text-gray-500">
                Please login to continue to your account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 w-full max-w-[360px]"
            >
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[48px] px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* OTP */}
              {showOTPField && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    OTP
                  </label>
                  <div className="relative">
                    <input
                      type={showOTP ? "text" : "password"}
                      name="otp"
                      placeholder="OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full h-[48px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={() => setShowOTP(!showOTP)}
                    >
                      {showOTP ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              )}

              {/* Send or Resend OTP */}
              <div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className={`text-sm font-medium ${
                    sendingOtp
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:underline"
                  }`}
                >
                  {sendingOtp
                    ? "Sending..."
                    : showOTPField
                    ? "Resend OTP"
                    : "Send OTP"}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
              transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                Sign in
              </button>
            </form>

            {/* Signup link */}
            <p className="text-[16px] text-gray-600">
              Need an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 font-semibold underline hover:opacity-90"
              >
                Create one
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden md:flex w-[849px] h-full items-center justify-center p-3">
          <div className="w-full h-full rounded-[24px] overflow-hidden">
            <img
              src={rightImg}
              alt="Visual"
              className="w-full h-full rounded-[24px] flex flex-row"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
