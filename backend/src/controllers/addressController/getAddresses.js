import User from "../../models/User.js";

export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json(user.savedAddresses);

  } catch (error) {
    return next(error);
  }
};