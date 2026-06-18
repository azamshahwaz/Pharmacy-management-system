import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";
import {
  getProfile,
  updateProfile,
  getUserById,
  getUserOrders,
  getUserPayments,
  getUserActivity,
  getProfileStats,
  getPaymentSettings,
  updatePaymentSettings,
  getRazorpayKey,
} from "../controllers/userController/index.js";


const router = express.Router();

// ======================================
// PROFILE ROUTES
// ======================================

router.get("/profile", protect, getProfile);

router.put(
  "/update-profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile
);

// ======================================
// PROFILE STATS
// ======================================

router.get("/profile/stats", protect, getProfileStats);

// ======================================
// PAYMENT SETTINGS
// MUST BE BEFORE "/:id"
// ======================================

router.get("/payment-settings", protect, getPaymentSettings);
router.put("/payment-settings", protect, updatePaymentSettings);

// ======================================
// RAZORPAY KEY
// ======================================

router.get("/razorpay-key", protect, getRazorpayKey);

// ======================================
// USER HISTORY ROUTES
// ======================================

router.get("/:id/orders", protect, getUserOrders);
router.get("/:id/payments", protect, getUserPayments);
router.get("/:id/activity", protect, getUserActivity);

// ======================================
// GET USER BY ID — KEEP THIS LAST
// ======================================

router.get("/:id", protect, getUserById);

export default router;