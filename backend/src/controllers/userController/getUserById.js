import User from "../../models/User.js";
import { canAccessUserData } from "../../utils/accessControl.js";

export const getUserById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const currentUser = req.user;

    const targetUser =
      await User.findById(id);

    if (!targetUser) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    // ACCESS CONTROL

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

    res.status(200).json({
      success: true,
      data: targetUser,
    });

  } catch (error) {
    console.error(
      "getUserById error:",
      error
    );

    next(error);
  }
};