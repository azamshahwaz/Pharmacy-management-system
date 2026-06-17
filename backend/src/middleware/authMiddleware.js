import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==============================
// Protect Routes
// ==============================
export const protect = async (
  req,
  res,
  next
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // ==============================
    // BLOCKED USER CHECK
    // ==============================

    if (user.isBlocked) {
      res.clearCookie("token");

      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }

    // ==============================
    // SOFT DELETED USER CHECK
    // ==============================

    if (user.deletionRequested) {
      res.clearCookie("token");

      return res.status(403).json({
        success: false,
        message:
          "Your account has been scheduled for deletion by admin",
      });
    }
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

// ==============================
// Admin Only
// ==============================
export const adminOnly = (
  req,
  res,
  next
) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

// ==============================
// Role Based Authorization
// ==============================
export const authorizeRoles =
  (...roles) =>
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized",
        });
      }

      if (
        !roles.includes(req.user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    };