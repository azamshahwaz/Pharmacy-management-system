import express from "express";

const router =
  express.Router();


// ======================================
// MIDDLEWARES
// ======================================

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";


// ======================================
// CONTROLLERS
// ======================================

import {

  // PASSWORD AND SECURITY SETTINGS
  changePassword,

  getSessions,

  logoutSession,

  logoutAllSessions,

  enable2FA,

  verify2FA,

  disable2FA,

  // NOTIFICATIONS
  getNotificationSettings,

  updateNotificationSettings,

  // DANGER ZONE
  deactivateAccount,

  requestAccountDeletion,

  restoreAccount,

  // ADMIN CONTROLS
  changeUserRole,

  blockUser,

  unblockUser,

} from
"../controllers/settingsController/index.js";


// ======================================
// PASSWORD & SECURITY SETTINGS
// ======================================

// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  changePassword
);

// ACTIVE SESSIONS
router.get(
  "/sessions",
  protect,
  getSessions
);

router.delete(
  "/sessions/:id",
  protect,
  logoutSession
);

router.delete(
  "/sessions",
  protect,
  logoutAllSessions
);

// TWO FACTOR AUTHENTICATION
router.post(
  "/enable-2fa",
  protect,
  enable2FA
);

router.post(
  "/verify-2fa",
  protect,
  verify2FA
);

router.post(
  "/disable-2fa",
  protect,
  disable2FA
);


// ======================================
// NOTIFICATION SETTINGS
// ======================================

router.get(
  "/notifications",
  protect,
  getNotificationSettings
);

router.put(
  "/notifications",
  protect,
  updateNotificationSettings
);


// ======================================
// DANGER ZONE
// ======================================

router.put(
  "/deactivate-account",
  protect,
  deactivateAccount
);

router.put(
  "/request-account-deletion",
  protect,
  requestAccountDeletion
);

router.put(
  "/restore-account",
  protect,
 restoreAccount
);


// ======================================
// ADMIN CONTROLS
// ======================================

router.put(
  "/change-role",
  protect,
  adminOnly,
  changeUserRole
);

router.put(
  "/block-user",
  protect,
  adminOnly,
  blockUser
);

router.put(
  "/unblock-user",
  protect,
  adminOnly,
  unblockUser
);


export default router;