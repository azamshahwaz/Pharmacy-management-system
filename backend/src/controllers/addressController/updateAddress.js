import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.savedAddresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    Object.assign(address, req.body);

    await user.save();

    // ✅ Activity Log
    await ActivityLog.create({
      user: user._id,
      action: "ADDRESS_UPDATED",
      targetId: address._id,
      targetType: "Address",
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });

  } catch (error) {
    return next(error);
  }
};