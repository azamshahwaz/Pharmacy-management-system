import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";
import { sendUserStatusEmail } from "../../utils/sendMail.js";

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const currentUser = req.user;

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentUser._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status",
      });
    }

    if (currentUser.role === "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer cannot approve or reject users",
      });
    }

    if (
      currentUser.role === "staff" &&
      targetUser.role !== "customer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Staff can only approve/reject customers",
      });
    }

    if (targetUser.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin status cannot be changed",
      });
    }

    if (targetUser.status === status) {
      return res.status(400).json({
        success: false,
        message: `User is already ${status}`,
      });
    }

    // ✅ Update status
    targetUser.status = status;

    if (status === "rejected") {
      targetUser.deleteAt = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      );
    } else {
      targetUser.deleteAt = null;
    }

    targetUser.actionBy = {
      userId: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      actionAt: new Date(),
    };

    await targetUser.save();

    // ✅ Activity Log
    await ActivityLog.create({
      user: currentUser._id,
      action:
        status === "approved"
          ? "USER_APPROVED"
          : "USER_REJECTED",
      targetId: targetUser._id,
      targetType: "User",
    });

    // ✅ Email (don't fail request if email fails)
    try {
      await sendUserStatusEmail(
        targetUser.email,
        targetUser
      );
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: `${targetUser.role} ${status} successfully`,
      user: targetUser,
    });

  } catch (error) {
    console.error("Update User Status Error:", error);
    return next(error);
  }
};