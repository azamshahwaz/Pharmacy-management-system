import express from "express";
import { protect } from "../middleware/authMiddleware.js";
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

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

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
// Admin Controls - User Actions
// ==============================
router.post(
  "/users/change-role",
  protect,
  authorizeRoles("admin"),
  changeUserRole
);

router.post(
  "/users/block",
  protect,
  authorizeRoles("admin"),
  blockUser
);

router.post(
  "/users/unblock",
  protect,
  authorizeRoles("admin"),
  unblockUser
);

router.post(
  "/users/soft-delete",
  protect,
  authorizeRoles("admin"),
  softDeleteUser
);

router.post(
  "/users/restore",
  protect,
  authorizeRoles("admin"),
  restoreUser
);

export default router;