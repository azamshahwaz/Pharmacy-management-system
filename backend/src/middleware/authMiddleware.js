import jwt from "jsonwebtoken";

import User from "../models/User.js";

// ==============================
// Protect Routes
// ==============================

export const protect = async (req, res, next) => {
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

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

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

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };

// ==============================
// Main Admin Control Permission
// ==============================
// Only the admin whose email is
// configured in ADMIN_CONTROL_EMAIL
// can perform sensitive admin operations.
//
// Example:
// ADMIN_CONTROL_EMAIL=myadmin@gmail.com
//
// Other users can still have role="admin"
// and access the Admin Dashboard,
// but they cannot perform sensitive
// admin-control operations.
// ==============================

export const adminControlPermission = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  // User must be an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  // Main admin email from environment variable
  const authorizedEmail =
    process.env.ADMIN_CONTROL_EMAIL
      ?.trim()
      .toLowerCase();

  // Logged-in user's email
  const loggedInEmail =
    req.user.email
      ?.trim()
      .toLowerCase();

  // Environment variable missing
  if (!authorizedEmail) {
    console.error(
      "ADMIN_CONTROL_EMAIL is not configured in .env"
    );

    return res.status(500).json({
      success: false,
      message: "Admin control authorization is not configured",
    });
  }

  // Logged-in admin is not the authorized admin
  if (loggedInEmail !== authorizedEmail) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized for admin control operations",
    });
  }

  next();
};