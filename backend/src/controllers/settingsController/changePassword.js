import User from "../../models/User.js";
import bcrypt from "bcrypt";
import { validatePassword } from "../../utils/passwordValidator.js";
import ActivityLog from "../../models/Activitylog.js";

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check fields
    if (!currentPassword || !newPassword) {
      const error = new Error(
        "Current password and new password are required"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      const error = new Error(
        "Password must contain uppercase, lowercase, number & special character"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      const error = new Error(
        "Current password incorrect"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Prevent same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      const error = new Error(
        "New password cannot be same as current password"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Update password
    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    // Activity Log
    await ActivityLog.create({
      user: user._id,
      action: "PASSWORD_CHANGED",
      targetId: user._id,
      targetType: "User",
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error(
      "changePassword error:",
      error
    );

    next(error);
  }
};