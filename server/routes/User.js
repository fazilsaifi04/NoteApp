const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  sendotp,
  verifyOtp,
  getMe,
} = require("../controller/Auth");

const { auth } = require("../middlewares/auth");

router.post("/send-otp", sendotp);

router.post("/signup", signup);

router.post("/login", login);

router.post("/verify-otp", verifyOtp); 

router.get("/me", auth, getMe);

// Get user info (name & email) — protected
// router.get("/user-info", auth, (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "User info fetched successfully",
//     user: {
//       name: req.user.name,
//       email: req.user.email,
//     },
//   });
// });

// // Example: Protected route (optional test)
// router.get("/protected", auth, (req, res) => {
//   res.json({
//     success: true,
//     message: "You are authorized",
//     user: req.user,
//   });
// });

module.exports = router;
