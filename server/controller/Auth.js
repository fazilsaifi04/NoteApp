const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    while (await OTP.findOne({ otp })) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    await OTP.create({ email, otp });

    console.log(`🔐 OTP sent to ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, dateOfBirth, email, otp } = req.body;

    if (!name || !dateOfBirth || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, dateOfBirth, email, OTP) are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please log in.",
      });
    }

    const latestOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!latestOTP.length || latestOTP[0].otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.create({
      name,
      dateOfBirth,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up.",
      });
    }

    const latestOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!latestOTP.length || latestOTP[0].otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const otps = {};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, dateOfBirth } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const existingOtp = await OTP.findOne({ email, otp }).sort({
      createdAt: -1,
    });

    if (!existingOtp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    const now = new Date();
    const otpAge = (now - existingOtp.createdAt) / 1000;
    if (otpAge > 300) {
      return res.status(401).json({ success: false, message: "OTP expired" });
    }

    await OTP.deleteMany({ email });

    let user = await User.findOne({ email });

    if (!user) {
      if (!name || !dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: "Missing name or date of birth for new user",
        });
      }

      user = await User.create({ email, name, dateOfBirth });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 Set token as cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax", // or "None" if frontend is on another origin
        secure: process.env.NODE_ENV === "production", // only true in prod
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ success: true, message: "OTP verified successfully", user });

    // 🎉 Send success response
    return res.status(200).json({
      success: true,
      message: "OTP verified and user authenticated",
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify OTP" });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
