import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.savedAddresses.find(
      (a) => a._id.toString() === req.params.id
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    user.savedAddresses = user.savedAddresses.filter(
      (a) => a._id.toString() !== req.params.id
    );

    await user.save();

    // ✅ Activity Log
    await ActivityLog.create({
      user: user._id,
      action: "ADDRESS_DELETED",
      targetId: address._id,
      targetType: "Address",
    });

    return res.status(200).json({
      success: true,
      message: "Address deleted",
    });

  } catch (error) {
    return next(error);
  }
};