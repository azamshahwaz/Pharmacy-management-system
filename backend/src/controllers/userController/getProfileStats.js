import mongoose from "mongoose";

import User from "../../models/User.js";
import Order from "../../models/Order.js";

export const getProfileStats = async (
  req,
  res,
  next
) => {
  try {
    // ================= LOGGED IN USER =================

    const userId =
      new mongoose.Types.ObjectId(
        req.user._id
      );

    // ================= FILTERED STATS =================

    const [
      usersManaged,
      ordersManaged,
      revenueData,
      recentOrders,
    ] = await Promise.all([

      // Users Managed

      User.countDocuments({
        "actionBy.userId":
          userId,
      }),

      // Orders Managed

      Order.countDocuments({
        "actionBy.userId":
          userId,
      }),

      // Revenue Generated

      Order.aggregate([
        {
          $match: {
            "actionBy.userId":
              userId,

            status: {
              $in: [
                "accepted",
                "delivered",
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum:
                "$grandTotal",
            },
          },
        },
      ]),

      // Recent Orders

      Order.find({
        "actionBy.userId":
          userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    // ================= RECENT ACTIVITIES =================

    const recentActivities =
      recentOrders.map(
        (order) => ({
          action:
            `Managed Order #${order._id
              .toString()
              .slice(-6)}`,
          createdAt:
            order.createdAt,
        })
      );

    // ================= RESPONSE =================

    res.status(200).json({
      success: true,

      data: {
        usersManaged,

        ordersManaged,

        revenueGenerated:
          revenueData?.[0]
            ?.total || 0,

        recentActivities,
      },
    });

  } catch (error) {
    console.error(
      "PROFILE STATS ERROR =>",
      error
    );

    next(error);
  }
};