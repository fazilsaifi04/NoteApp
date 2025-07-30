import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import instance from "../api/api";
import rightImg from "../assets/right-column.png";
import logo from "../assets/top.png";
import { Navigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    otp: "",
  });

  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, dateOfBirth, email, otp } = formData;

    if (!email || !name || !dateOfBirth) {
      alert("All fields are required.");
      return;
    }

    if (!showOtpField) {
      setShowOtpField(true);
      setLoading(true);

      try {
        await instance.post("/auth/send-otp", { email });
        alert("OTP sent to your email!");
      } catch (err) {
        console.error("Error sending OTP:", err?.response?.data || err.message);
        alert(err?.response?.data?.message || "Failed to send OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!otp) {
        alert("Please enter the OTP.");
        return;
      }

      setLoading(true);
      try {
        await instance.post("/auth/verify-otp", {
          email,
          otp,
          name,
          dateOfBirth,
        });

        alert("Signup successful!");
        navigate("/dashboard");
      } catch (err) {
        console.error(
          "Error verifying OTP:",
          err?.response?.data || err.message
        );
        alert(err?.response?.data?.message || "Signup failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center px-4 py-6 md:px-10 relative">
      <div className="w-full max-w-[1440px] h-full flex flex-col md:flex-row rounded-[32px] border border-gray-200 overflow-hidden shadow-md relative">
        {/* Top logo */}
        <div className="absolute top-8 left-8 flex items-center space-x-3 z-10">
          <img src={logo} alt="Logo" className="w-320 h-79" />
          {/* <h1 className="text-[24px] font-semibold text-gray-900">HD</h1> */}
        </div>

        {/* Left Panel */}
        <div className="w-full md:w-[520px] h-full flex flex-col justify-center px-6 md:px-[48px] py-6 bg-white">
          <div className="flex flex-col space-y-6 justify-center">
            <div className="space-y-2">
              <h2 className="text-[32px] font-bold text-gray-900 leading-tight">
                Sign up
              </h2>
              <p className="text-[16px] text-gray-500">
                Sign up to enjoy the feature of HD
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 w-full max-w-[360px]"
            >
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-[48px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full h-[48px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

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
              {showOtpField && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full h-[48px] px-3 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-[48px] ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium rounded-lg 
    transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg`}
              >
                {loading
                  ? showOtpField
                    ? "Signing up..."
                    : "Sending OTP..."
                  : showOtpField
                  ? "Sign up"
                  : "Get OTP"}
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-[16px] text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 font-semibold underline hover:opacity-90"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel - Image */}
        <div className="hidden md:flex w-[849px] h-full items-center justify-center p-3">
          <div className="w-full h-full rounded-[24px] overflow-hidden">
            <img
              src={rightImg}
              alt="Visual"
              className="w-full h-full rounded-[24px]  flex  flex-row"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
