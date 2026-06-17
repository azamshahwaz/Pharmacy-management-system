import speakeasy from "speakeasy";
import QRCode from "qrcode";

import User from "../../models/User.js";

// ================= ENABLE 2FA =================

export const enable2FA = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    // Generate Secret

    const secret =
      speakeasy.generateSecret({
        name: `MyApp (${user.email})`,
      });

    // Generate QR Code

    const qrCode =
      await QRCode.toDataURL(
        secret.otpauth_url
      );

    // Save Secret

    user.twoFactorSecret =
      secret.base32;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "2FA setup initialized",

      qrCode,

      // Optional:
      // Production me secret expose
      // na karna better hai

      secret: secret.base32,
    });

  } catch (error) {
    console.error(
      "Enable 2FA Error:",
      error
    );

    next(error);
  }
};

// ================= VERIFY 2FA =================

export const verify2FA = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.body;

    if (!token) {
      const error = new Error(
        "OTP is required"
      );

      error.statusCode = 400;

      return next(error);
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      return next(error);
    }

    const verified =
      speakeasy.totp.verify({
        secret:
          user.twoFactorSecret,

        encoding: "base32",

        token,
      });

    if (!verified) {
      const error = new Error(
        "Invalid OTP"
      );

      error.statusCode = 400;

      return next(error);
    }

    user.twoFactorEnabled =
      true;

    await user.save();

    res.status(200).json({
      success: true,

      message:
        "2FA enabled successfully",
    });

  } catch (error) {
    console.error(
      "Verify 2FA Error:",
      error
    );

    next(error);
  }
};

// ================= DISABLE 2FA =================

export const disable2FA = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      return next(error);
    }

    user.twoFactorEnabled =
      false;

    user.twoFactorSecret =
      "";

    await user.save();

    res.status(200).json({
      success: true,

      message:
        "2FA disabled successfully",
    });

  } catch (error) {
    console.error(
      "Disable 2FA Error:",
      error
    );

    next(error);
  }
};