const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  INVALID_OTP: "Invalid or expired OTP",
  USER_EXISTS: "User already exists. Please log in.",
  FIELDS_REQUIRED: "All required fields are missing",
  USER_NOT_FOUND: "User not found. Please sign up.",
  AUTH_FAILED: "Not authenticated"
};

// Helper: Generate Unique OTP
const generateUniqueOTP = async () => {
  let otp;
  do {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
  } while (await OTP.findOne({ otp }));
  return otp;
};

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.EMAIL_REQUIRED });
    }

    const existingUser = await User.findOne({ email });
    const otp = await generateUniqueOTP();

    await OTP.create({ email, otp });
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, dateOfBirth, email, otp } = req.body;
    if (!name || !dateOfBirth || !email || !otp) {
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.FIELDS_REQUIRED });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.USER_EXISTS });
    }

    const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOTP || latestOTP.otp !== otp) {
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_OTP });
    }

    const user = await User.create({ name, dateOfBirth, email });
    await OTP.deleteMany({ email });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOTP || latestOTP.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const existingOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: "New User", email });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findById(req.user.userId).select("name email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
