import ActivityLog from "../../models/Activitylog.js";
import User from "../../models/User.js";

export const getUserActivity = async (
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

    // ACCESS RULES

    if (currentUser.role !== "admin") {
      if (
        currentUser._id.toString() !==
        id
      ) {
        const error = new Error(
          "Access denied"
        );
        error.statusCode = 403;
        return next(error);
      }
    }

    // Recent Activities

    const logs =
      await ActivityLog.find({
        user: id,
      })
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });

  } catch (error) {
    console.error(
      "getUserActivity error:",
      error
    );

    next(error);
  }
};