import User from "../../models/User.js";

export const getAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Welcome Admin!",
      admin,
    });

  } catch (error) {
    return next(error);
  }
};