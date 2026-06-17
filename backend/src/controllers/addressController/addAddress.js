import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.savedAddresses.push(req.body);

    await user.save();

    const addedAddress =
      user.savedAddresses[user.savedAddresses.length - 1];

    await ActivityLog.create({
      user: user._id,
      action: "ADDRESS_ADDED",
      targetId: addedAddress._id,
      targetType: "Address",
    });

    return res.status(201).json({
      success: true,
      addresses: user.savedAddresses,
    });

  } catch (error) {
    return next(error);
  }
};