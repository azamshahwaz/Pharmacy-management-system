import User from "../../models/User.js";
import APIFeatures from "../../utils/apiFeatures.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      User.find().select("-password -isVerified"),
      req.query
    )
      .search(["name", "email"])
      .filter()
      .sort();

    const users = await features.query;

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    return next(error);
  }
};