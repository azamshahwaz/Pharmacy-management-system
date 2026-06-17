export const canAccessUserData = (currentUser, targetUser) => {
  // admin → sab access
  if (currentUser.role === "admin") return true;

  // staff → only customers
  if (currentUser.role === "staff") {
    return targetUser.role === "customer";
  }

  // customer → only self
  if (currentUser.role === "customer") {
    return currentUser._id.toString() === targetUser._id.toString();
  }

  return false;
};