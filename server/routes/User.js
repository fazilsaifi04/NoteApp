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

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

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
