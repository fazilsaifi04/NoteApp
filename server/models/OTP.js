const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/template/emailVerifictaionTempl");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

// Send verification email when OTP is created
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const mailResponse = await mailSender(
        this.email,
        "Verification Email",
        emailTemplate(this.otp)
      );
      console.log("OTP email sent:", mailResponse);
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
