import Order from "../../models/Order.js";
import User from "../../models/User.js";
import { canAccessUserData } from "../../utils/accessControl.js";

export const getUserOrders = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const currentUser = req.user;

    // Find target user

    const targetUser =
      await User.findById(id);

    if (!targetUser) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    // Access Control

    if (
      !canAccessUserData(
        currentUser,
        targetUser
      )
    ) {
      const error = new Error(
        "Access denied"
      );
      error.statusCode = 403;
      return next(error);
    }

    // Get Orders

    const orders =
      await Order.find({
        "user.userId": id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    console.error(
      "getUserOrders error:",
      error
    );

    next(error);
  }
};