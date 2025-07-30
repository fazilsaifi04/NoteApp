const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; 
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
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
