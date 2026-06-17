// src/services/settingsApi.js
import API from "./apiClient";

// ======================================
// NOTIFICATIONS
// ======================================
export const getNotificationSettings = async () => {
  const response = await API.get("/settings/notifications");
  return response.data;
};

export const updateNotificationSettings = async (data) => {
  const response = await API.put("/settings/notifications", data);
  return response.data;
};

// ======================================
// DANGER ZONE
// ======================================
export const requestAccountDeletion = async () => {
  const response = await API.put("/settings/request-account-deletion", {});
  return response.data;
};

export const restoreAccount = async () => {
  const response = await API.put("/settings/restore-account", {});
  return response.data;
};

// ======================================
// ADMIN CONTROLS
// ======================================
export const changeUserRole = async (data) => {
  const response = await API.put("/settings/change-role", data);
  return response.data;
};