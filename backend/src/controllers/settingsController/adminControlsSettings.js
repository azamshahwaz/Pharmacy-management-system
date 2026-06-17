import User from "../../models/User.js";

// ======================================
// CHANGE USER ROLE
// ======================================

export const changeUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    const allowedRoles = ["admin", "staff", "customer"];

    if (!allowedRoles.includes(role)) {
      const error = new Error("Invalid Role");
      error.statusCode = 400;
      return next(error);
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // ======================================
    // CANNOT CHANGE ROLE OF DELETED USER
    // ======================================

    if (targetUser.deletionRequested) {
      const error = new Error(
        "Cannot change role of a user scheduled for deletion"
      );

      error.statusCode = 400;

      return next(error);
    }

    // ======================================
    // MAXIMUM 2 ADMINS ALLOWED
    // ======================================

    if (
      role === "admin" &&
      targetUser.role !== "admin"
    ) {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount >= 2) {
        const error = new Error(
          "Maximum 2 admins allowed at a time"
        );

        error.statusCode = 400;

        return next(error);
      }
    }

    // ======================================
    // AT LEAST 1 ADMIN MUST REMAIN
    // ======================================

    if (
      targetUser.role === "admin" &&
      role !== "admin"
    ) {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        const error = new Error(
          "At least one admin must exist in the system"
        );

        error.statusCode = 400;

        return next(error);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "User role updated",
      data: updatedUser,
    });

  } catch (error) {
    console.error("changeUserRole error:", error);
    next(error);
  }
};

// ======================================
// BLOCK USER
// ======================================

export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User Blocked",
    });

  } catch (error) {
    console.error("blockUser error:", error);
    next(error);
  }
};

// ======================================
// UNBLOCK USER
// ======================================

export const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User Unblocked",
    });

  } catch (error) {
    console.error("unblockUser error:", error);
    next(error);
  }
};

// ======================================
// SOFT DELETE USER
// MongoDB TTL index will auto-permanently
// delete after deleteAt time passes
// ======================================

export const softDeleteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }
    // 10 days from now - MongoDB TTL will handle permanent deletion
    const tenDaysFromNow = new Date(
      Date.now() + 10 * 24 * 60 * 60 * 1000
    );
const userToDelete = await User.findById(userId);

if (!userToDelete) {
  const error = new Error("User not found");
  error.statusCode = 404;
  return next(error);
}

if (userToDelete.role === "admin") {

  const adminCount = await User.countDocuments({
    role: "admin",
    deletionRequested: false,
  });

  if (adminCount <= 1) {
    return res.status(400).json({
      success: false,
      message: "At least one active admin must remain",
    });
  }
}
    const user = await User.findByIdAndUpdate(
      userId,
      {
        deleteAt: tenDaysFromNow,
        deletionRequested: true,
      },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User scheduled for deletion. Will be permanently deleted after 10 days.",
      deleteAt: tenDaysFromNow,
    });

  } catch (error) {
    console.error("softDeleteUser error:", error);
    next(error);
  }
};

// ======================================
// RESTORE USER (cancel soft delete)
// ======================================

export const restoreUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        deleteAt: null,
        deletionRequested: false,
      },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User restored successfully.",
    });

  } catch (error) {
    console.error("restoreUser error:", error);
    next(error);
  }
};