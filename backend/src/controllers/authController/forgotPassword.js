import User from "../../models/User.js";
import { generateOTP } from "../../utils/passwordValidator.js";
import { sendOTPEmail } from "../../utils/sendMail.js";

export const forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;

    // ===== Normalize =====
    email = email?.toLowerCase().trim();

    // ===== Required check =====
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ===== Email format validation =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ===== Check user exists =====
    const user = await User.findOne({ email });

    // 🔒 Security: same response whether user exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent",
      });
    }

    // ===== Generate OTP =====
    const otp = generateOTP();

    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    // ===== Send OTP =====
    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      const error = new Error(
        "Failed to send OTP. Try again later"
      );
      error.statusCode = 500;
      return next(error);
    }

    // ===== Success =====
    return res.status(200).json({
      success: true,
      message: "If this email is registered, an OTP has been sent",
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return next(error);
  }
};