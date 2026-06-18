import User from "../../models/User.js";

// ======================================
// GET PAYMENT SETTINGS
// ======================================

export const getPaymentSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+paymentSettings");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: {
        preferredMethod: user.paymentSettings?.preferredMethod || "upi",
        upiId: user.paymentSettings?.upiId || "",
        preferredCardName: user.paymentSettings?.preferredCardName || "",
        allowCOD: user.paymentSettings?.allowCOD ?? true,
        savePaymentHistory: user.paymentSettings?.savePaymentHistory ?? true,
        paymentNotifications: user.paymentSettings?.paymentNotifications ?? true,
      },
    });
  } catch (error) {
    console.error("GET PAYMENT SETTINGS ERROR:", error);
    next(error);
  }
};

// ======================================
// UPDATE PAYMENT SETTINGS
// ======================================

export const updatePaymentSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const currentSettings = user.paymentSettings || {};

    const {
      preferredMethod,
      upiId,
      preferredCardName,
      allowCOD,
      savePaymentHistory,
      paymentNotifications,
    } = req.body;

    user.paymentSettings = {
      ...currentSettings,
      preferredMethod: preferredMethod ?? currentSettings.preferredMethod ?? "upi",
      upiId: upiId ?? currentSettings.upiId ?? "",
      preferredCardName: preferredCardName ?? currentSettings.preferredCardName ?? "",
      allowCOD: allowCOD ?? currentSettings.allowCOD ?? true,
      savePaymentHistory: savePaymentHistory ?? currentSettings.savePaymentHistory ?? true,
      paymentNotifications: paymentNotifications ?? currentSettings.paymentNotifications ?? true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment settings updated successfully",
      data: user.paymentSettings,
    });
  } catch (error) {
    console.error("UPDATE PAYMENT SETTINGS ERROR:", error);
    next(error);
  }
};

// ======================================
// GET RAZORPAY KEY
// ======================================

export const getRazorpayKey = (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};