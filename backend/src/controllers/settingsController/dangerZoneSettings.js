import User from "../../models/User.js";

// ======================================
// DEACTIVATE ACCOUNT
// ======================================

export const deactivateAccount = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          isDeactivated: true,
        },
        {
          new: true,
        }
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
      message: "Account Deactivated",
    });

  } catch (error) {
    console.error(
      "deactivateAccount error:",
      error
    );
    next(error);
  }
};

// ======================================
// REQUEST ACCOUNT DELETION
// ======================================

export const requestAccountDeletion =
  async (req, res, next) => {
    try {
      const currentUser = await User.findById(
      req.user.id
    );

    if (
      currentUser &&
      currentUser.role === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot be deleted",
      });
    }
      const deleteAfter =
        new Date(
          Date.now() +
            15 *
              24 *
              60 *
              60 *
              1000
        );

      const user =
        await User.findByIdAndUpdate(
          req.user.id,
          {
            deletionRequested: true,
            deleteAt: deleteAfter,
          },
          {
            new: true,
          }
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
        message:
          "Account scheduled for deletion in 15 days",
        deleteAt: deleteAfter,
      });

    } catch (error) {
      console.error(
        "requestAccountDeletion error:",
        error
      );
      next(error);
    }
  };

// ======================================
// RESTORE ACCOUNT
// ======================================

export const restoreAccount = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          deletionRequested: false,
          deleteAt: null,
          isDeactivated: false,
        },
        {
          new: true,
        }
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
      message:
        "Account Restored Successfully",
    });

  } catch (error) {
    console.error(
      "restoreAccount error:",
      error
    );
    next(error);
  }
};