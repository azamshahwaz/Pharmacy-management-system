import API from "../services/apiClient";

// Get Admin Profile
export const getAdminProfile = async () => {
  try {
    const { data } = await API.get("/admin");
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get All Users
export const getAllUsers = async () => {
  try {
    const { data } = await API.get("/admin/users");
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Update User Status
export const updateUserStatus = async (id, status) => {
  try {
    const { data } = await API.put(`/admin/${id}`, {
      isApproved: status,
    });

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Delete User
export const deleteUser = async (id) => {
  try {
    const { data } = await API.delete(`/admin/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};