import Order from "../../models/Order.js";
import User from "../../models/User.js";

export const getAdminReports = async (req, res, next) => {
  try {
    // =========================
    // USERS
    // =========================
    const users = await User.find().select("-password");

    const totalUsers = users.length;

    const pendingUsers = users.filter(
      (user) => user?.status?.toLowerCase() === "pending"
    ).length;

    // =========================
    // ORDERS
    // =========================
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order?.status?.toLowerCase() === "pending"
    ).length;

    // =========================
    // REVENUE
    // =========================
    const revenue = orders
      .filter((item) => item.status === "delivered")
      .reduce(
        (acc, item) => acc + (item.grandTotal || 0),
        0
      );

    // =========================
    // TOTAL SALES
    // =========================
    const totalSalesData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalItems: { $sum: "$items.quantity" },
        },
      },
    ]);

    const totalSales =
      totalSalesData[0]?.totalItems || 0;

    // =========================
    // TOP MEDICINES
    // =========================
    const topMedicines = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // =========================
    // RECENT ORDERS
    // =========================
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,

      totalUsers,
      pendingUsers,

      totalOrders,
      pendingOrders,

      revenue,
      totalSales,

      topMedicines,
      recentOrders,

      users,
      orders,
    });

  } catch (error) {
    console.error("REPORT ERROR:", error);
    return next(error);
  }
};