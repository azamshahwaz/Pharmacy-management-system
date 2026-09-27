import express from "express";

import {
  protect,
  adminControlPermission,
} from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getAdmin,
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getDashboardStats,
  getAdminReports,
  getManagedUsers,
} from "../controllers/adminController/index.js";

import {
  changeUserRole,
  blockUser,
  unblockUser,
  softDeleteUser,
  restoreUser,
} from "../controllers/settingsController/adminControlsSettings.js";

const router = express.Router();

// ==============================
// Admin Profile
// ==============================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAdmin
);

// ==============================
// User Management
// ==============================

router.get(
  "/users",
  protect,
  authorizeRoles("admin", "staff"),
  getAllUsers
);

// ==============================
// Update User
// Admin + Staff can update
// ==============================

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "staff"),
  updateUserStatus
);

// ==============================
// Dashboard Stats
// ==============================

router.get(
  "/dashboard/stats",
  protect,
  authorizeRoles("admin", "staff", "customer"),
  getDashboardStats
);

// ==============================
// Reports
// ==============================

router.get(
  "/reports",
  protect,
  authorizeRoles("admin"),
  getAdminReports
);

// ==============================
// Managed Users
// ==============================

router.get(
  "/managed-users",
  protect,
  authorizeRoles("admin", "staff"),
  getManagedUsers
);

// ==============================
// ADMIN CONTROL OPERATIONS
// ONLY ADMIN_CONTROL_EMAIL
// ==============================

// Change user role
router.post(
  "/users/change-role",
  protect,
  adminControlPermission,
  changeUserRole
);

// Block user
router.post(
  "/users/block",
  protect,
  adminControlPermission,
  blockUser
);

// Unblock user
router.post(
  "/users/unblock",
  protect,
  adminControlPermission,
  unblockUser
);

// Soft delete user
router.post(
  "/users/soft-delete",
  protect,
  adminControlPermission,
  softDeleteUser
);

// Restore user
router.post(
  "/users/restore",
  protect,
  adminControlPermission,
  restoreUser
);

// Permanent delete user
router.delete(
  "/:id",
  protect,
  adminControlPermission,
  deleteUser
);

export default router;