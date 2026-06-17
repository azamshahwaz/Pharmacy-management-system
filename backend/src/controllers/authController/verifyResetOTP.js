import User from "../../models/User.js";

export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    // ===== OTP Match =====
    if (!user || user.resetOTP?.toString() !== otp?.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ===== Expiry Check =====
    if (user.resetOTPExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });

  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);
    return next(error);
  }
};