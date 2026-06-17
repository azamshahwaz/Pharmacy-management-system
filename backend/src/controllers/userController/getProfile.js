import User from "../../models/User.js";

export const getProfile = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error(
      "getProfile error:",
      error
    );

    next(error);
  }
};