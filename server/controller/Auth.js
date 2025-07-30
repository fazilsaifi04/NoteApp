const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();

// Common error messages
const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  INVALID_OTP: "Invalid or expired OTP",
  USER_EXISTS: "User already exists. Please log in.",
  FIELDS_REQUIRED: "All required fields are missing",
  USER_NOT_FOUND: "User not found. Please sign up.",
  AUTH_FAILED: "Not authenticated"
};

// Helper function to generate OTP
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
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.EMAIL_REQUIRED 
      });
    }

    const existingUser = await User.findOne({ email });
    const otp = await generateUniqueOTP();
    
    await OTP.create({ email, otp });
    console.log(`OTP for ${email}: ${otp}`); // Remove in production

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, dateOfBirth, email, otp } = req.body;

    if (!name || !dateOfBirth || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.FIELDS_REQUIRED
      });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.USER_EXISTS
      });
    }

    const latestOTP = await OTP.findOne({ email })
      .sort({ createdAt: -1 });
      
    if (!latestOTP || latestOTP.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.INVALID_OTP 
      });
    }

    const user = await User.create({ name, dateOfBirth, email });
    await OTP.deleteMany({ email });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.FIELDS_REQUIRED
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOTP || latestOTP.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.INVALID_OTP 
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });

    await OTP.deleteMany({ email });

    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, dateOfBirth } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.FIELDS_REQUIRED 
      });
    }

    const existingOtp = await OTP.findOne({ email, otp })
      .sort({ createdAt: -1 });

    if (!existingOtp) {
      return res.status(401).json({ 
        success: false, 
        message: ERROR_MESSAGES.INVALID_OTP 
      });
    }

    const otpAge = (Date.now() - existingOtp.createdAt) / 1000;
    if (otpAge > 300) {
      return res.status(401).json({ 
        success: false, 
        message: "OTP expired" 
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      if (!name || !dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: "New users require name and date of birth"
        });
      }
      user = await User.create({ email, name, dateOfBirth });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === "production" ? '.onrender.com' : undefined
    });

    await OTP.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to verify OTP" 
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    // Debug: Log the decoded user from the token
    console.log("Decoded user from token:", req.user);
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    const user = await User.findById(req.user.userId)
      .select("-__v -createdAt -updatedAt -password");

    if (!user) {
      console.error(`User ${req.user.userId} not found in database`);
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};