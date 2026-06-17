import express from "express";

import {
  signup,
  login,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authController/index.js";

import { loginLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  signupValidation,
  loginValidation,
  verifyOTPValidation,
  resendOTPValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
} from "../validator/authValidator.js";

const router = express.Router();

// ======================================
// AUTH ROUTES
// ======================================

router.post(
  "/signup",
  signupValidation,
  validate,
  signup
);

router.post(
  "/login",
  loginValidation,
  validate,
  loginLimiter,
  login
);

router.post(
  "/logout",
  protect,
  logout
);

// ======================================
// OTP ROUTES
// ======================================

router.post(
  "/verify-otp",
  verifyOTPValidation,
  validate,
  verifyOTP
);

router.post(
  "/resend-otp",
  resendOTPValidation,
  validate,
  resendOTP
);

// ======================================
// PASSWORD RESET ROUTES
// ======================================

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOTPValidation,
  validate,
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword
);

export default router;