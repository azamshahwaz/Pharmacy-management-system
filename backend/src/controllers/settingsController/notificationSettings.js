import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";

// ======================================
// GET NOTIFICATION SETTINGS
// ======================================

export const getNotificationSettings = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user.notificationSettings,
    });

  } catch (error) {
    console.error(
      "getNotificationSettings error:",
      error
    );
    next(error);
  }
};

// ======================================
// UPDATE NOTIFICATION SETTINGS
// ======================================

export const updateNotificationSettings =
  async (req, res, next) => {
    try {
      const updatedUser =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            notificationSettings:
              req.body,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedUser) {
        const error = new Error(
          "User not found"
        );
        error.statusCode = 404;
        return next(error);
      }

      // Activity Log
      await ActivityLog.create({
        user: req.user._id,
        action:
          "NOTIFICATION_SETTINGS_UPDATED",
        targetId: req.user._id,
        targetType: "User",
      });

      res.status(200).json({
        success: true,
        data:
          updatedUser.notificationSettings,
      });

    } catch (error) {
      console.error(
        "updateNotificationSettings error:",
        error
      );
      next(error);
    }
  };