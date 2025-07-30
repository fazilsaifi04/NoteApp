const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");



exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    let message = "Authentication failed";

    if (error.name === 'TokenExpiredError') {
      message = "Session expired. Please login again";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Invalid authentication token";
    }

    return res.status(401).json({ success: false, message });
  }
};



// exports.protect = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "Not authenticated" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.userId).select("-__v");

//     if (!req.user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }
// };
