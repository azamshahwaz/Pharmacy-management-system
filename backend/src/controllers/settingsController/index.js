// PASSWORD AND SECURITY SETTINGS
export {changePassword} from "./changePassword.js";
export {
  getSessions,
  logoutSession,
  logoutAllSessions,
} from "./session.js";
export {
  enable2FA,
  verify2FA,
  disable2FA,
} from "./2FA.js";
// NOTIFICATION SETTINGS
export {

  getNotificationSettings,

  updateNotificationSettings,

} from "./notificationSettings.js";


// ======================================
// DANGER ZONE SETTINGS
// ======================================

export {

  deactivateAccount,

  requestAccountDeletion,

  restoreAccount,

} from "./dangerZoneSettings.js";


// ======================================
// ADMIN CONTROLS SETTINGS
// ======================================

export {changeUserRole, blockUser, unblockUser} from "./adminControlsSettings.js";