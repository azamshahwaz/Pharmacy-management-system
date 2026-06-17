import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import { canAccessUserData } from "../../utils/accessControl.js";

export const getUserPayments = async (
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

    // Fetch Payments

    const payments =
      await Payment.find({
        user: id,
      })
        .populate("order")
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {
    console.error(
      "getUserPayments error:",
      error
    );

    next(error);
  }
};