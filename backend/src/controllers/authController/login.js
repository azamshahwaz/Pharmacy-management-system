import { logger } from "../../utils/logger.js";
import User from "../../models/User.js";
import Session from "../../models/SessionModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import { validationResult } from "express-validator";

export const login = async (req, res, next) => {
  try {

    // ==============================
    // ✅ VALIDATION CHECK
    // ==============================
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, phone, password } = req.body;

    // ==============================
    // ✅ EMAIL OR PHONE REQUIRED
    // ==============================
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required field(s): email or phone",
      });
    }

    // ==============================
    // ✅ FIND USER
    // ==============================
    const user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ==============================
    // BLOCK CHECK
    // ==============================

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }

    // ==============================
    // DELETION CHECK
    // ==============================

    if (user.deletionRequested) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been scheduled for deletion by admin",
      });
    }

    // ==============================
    // 🔒 ACCOUNT LOCK CHECK
    // ==============================
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);

      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes`,
      });
    }

    // ==============================
    // ✅ PASSWORD MATCH
    // ==============================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.wrongPasswordAttempts += 1;

      logger.warn({
        type: "LOGIN_FAILED",
        userId: user._id,
        email: user.email,
        attempts: user.wrongPasswordAttempts,
        ip: req.ip,
      });

      // 🔒 LOCK AFTER 5 ATTEMPTS
      if (user.wrongPasswordAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);

        logger.warn({
          type: "ACCOUNT_LOCKED",
          userId: user._id,
          email: user.email,
          ip: req.ip,
        });
      }

      await user.save();

      const attemptsLeft = Math.max(0, 5 - user.wrongPasswordAttempts);

      return res.status(400).json({
        success: false,
        message:
          attemptsLeft > 0
            ? `Wrong password. ${attemptsLeft} attempt(s) left`
            : "Account locked for 1 hour due to too many failed attempts",
      });
    }

    // ==============================
    // ✅ RESET FAILED ATTEMPTS (background — login response ko block nahi karega)
    // ==============================
    user.wrongPasswordAttempts = 0;
    user.lockUntil = null;
    user.save().catch((err) =>
      logger.error({
        type: "ATTEMPT_RESET_FAILED",
        userId: user._id,
        error: err.message,
      })
    );

    // ==============================
    // ✅ ACCOUNT STATUS CHECK
    // ==============================
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved yet",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected",
      });
    }

    // ==============================
    // ✅ GENERATE JWT TOKEN
    // ==============================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ==============================
    // ✅ SET HTTP-ONLY COOKIE
    // ==============================
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ==============================
    // ✅ GET DEVICE INFO
    // ==============================
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    // ==============================
    // ✅ FINAL RESPONSE — pehle bhejo, session save background mein
    // ==============================
    res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        address: user.address || "",
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      },
    });

    // ==============================
    // ✅ SAVE SESSION (non-blocking)
    // ==============================
    Session.create({
      user: user._id,
      token,
      device: result.device.model || "Desktop",
      browser: result.browser.name || "Unknown Browser",
      os: result.os.name
        ? `${result.os.name} ${result.os.version || ""}`.trim()
        : "Unknown OS",
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        "Unknown IP",
      lastActive: new Date(),
    }).catch((err) =>
      logger.error({
        type: "SESSION_SAVE_FAILED",
        userId: user._id,
        error: err.message,
      })
    );

  } catch (error) {
    next(error);
  }
};