import User from "../../models/User.js";

export const getManagedUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      "actionBy.userId": req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {
    return next(error);
  }
};