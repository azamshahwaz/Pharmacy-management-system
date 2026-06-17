import API from "./apiClient";

// 👉 GET ALL USERS
export const getAllUsers =
  async () => {
    const res = await API.get(
      "/admin/users"
    );

    return res.data;
  };

// 👉 UPDATE USER STATUS
export const updateUserStatus =
  async (userId, status) => {
    try {
      const res = await API.put(
        `/admin/${userId}`,
        { status }
      );

      return res.data;
    } catch (error) {
      console.error(
        "Error updating user status:",
        error
      );

      throw error;
    }
  };

// 👉 GET MANAGED USERS
export const getManagedUsers =
  async () => {
    const res = await API.get(
      "/admin/managed-users"
    );

    return res.data;
  };

// 👉 GET MANAGED ORDERS
export const getManagedOrders =
  async () => {
    const res = await API.get(
      "/orders/managed-orders"
    );

    return res.data;
  };

// 👉 GET PENDING ORDERS
export const getPendingOrders =
  async () => {
    const res = await API.get(
      "/orders/pending-orders"
    );

    return res.data;
  };