import Order from "../../models/Order.js";

export const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate, staffId, userId } = req.query;

    const match = {};

    // Date Filter
    if (startDate || endDate) {
      match.createdAt = {};

      if (startDate) {
        match.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        match.createdAt.$lte = new Date(endDate);
      }
    }

    // Role Based Filter
    if (req.user.role === "admin") {
      if (staffId) match.staff = staffId;
      if (userId) match.user = userId;
    } else if (req.user.role === "staff") {
      match.staff = req.user._id;
    } else if (req.user.role === "user") {
      match.user = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,

          totalOrders: { $sum: 1 },

          totalRevenue: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          accepted: {
            $sum: {
              $cond: [{ $eq: ["$status", "accepted"] }, 1, 0],
            },
          },

          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
            },
          },

          delivered: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
            },
          },

          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        accepted: 0,
        rejected: 0,
        delivered: 0,
        pending: 0,
      },
    });
  } catch (error) {
    console.error("getOrderStats error:", error);
    next(error); // ✅ Global Error Handler ko bhej do
  }
};