export const getMembershipLevel = (
  totalOrders,
  totalSpent
) => {
  if (
    totalOrders >= 100 ||
    totalSpent >= 1000000
  ) {
    return "Platinum";
  }

  if (
    totalOrders >= 50 ||
    totalSpent >= 500000
  ) {
    return "Gold";
  }

  if (
    totalOrders >= 20 ||
    totalSpent >= 100000
  ) {
    return "Silver";
  }

  return "Standard";
};