const express = require("express");
const router = express.Router();
const {
  createAccount,
  registerUser,
  verifyOtp,
  resendOtp,
  startForgetPassword,
  completeForgetPassword,
} = require("../controllers/user");

router.post("/create-account", createAccount);
router.post("/register", registerUser);
router.patch("/verify-otp/:email/:otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forget-password", startForgetPassword);
router.patch("/reset-password", completeForgetPassword);

module.exports = router;
