import User from "../../models/User.js";
import bcrypt from "bcrypt";
import { validatePassword, generateOTP } from "../../utils/passwordValidator.js";
import { sendOTPEmail } from "../../utils/sendMail.js";
import { tempUsers } from "../../utils/tempStore.js";

export const signup = async (req, res, next) => {
  try {
    let { name, email, phone, password, role, address } = req.body;

    // ===== Normalize =====
    email = email?.toLowerCase().trim();
    phone = String(phone).trim();
    name = name?.trim();

    // ===== Required fields =====
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ===== Name validation =====
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Name should only contain letters and spaces" });
    }

    // ===== Role validation =====
    const allowedRoles = ["admin", "staff", "customer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ===== Prevent multiple admins =====
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      const tempAdminExists = [...tempUsers.values()].some(
        (u) => u.role === "admin"
      );
      if (existingAdmin || tempAdminExists) {
        return res.status(403).json({
          message: "Admin already exists. Only one admin allowed",
        });
      }
    }

    // ===== Email validation =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ===== Phone validation =====
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // ===== Password validation =====
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Weak password" });
    }

    // ===== Address validation (customer only) =====
    if (role === "customer") {
      if (!address || !address.shopName || !address.street || !address.city) {
        return res.status(400).json({
          message: "All address fields are required for customer",
        });
      }
    }

    // ===== Existing user check =====
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Email or phone already registered",
      });
    }

    // ===== Resend OTP if temp user already exists =====
    const tempUser = tempUsers.get(email);
    if (tempUser) {
      const otp = generateOTP();
      tempUsers.set(email, {
        ...tempUser,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      });

      // ✅ Response pehle, mail baad mein (non-blocking)
      res.status(200).json({ message: "New OTP sent successfully" });
      sendOTPEmail(email, otp).catch((err) =>
        console.log("OTP resend mail failed:", err)
      );
      return;
    }

    // ===== Hash password =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== Generate OTP =====
    const otp = generateOTP();

    // ===== Store temporarily =====
    tempUsers.set(email, {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      address,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });

    // ✅ Response pehle bhejo, mail baad mein jaayegi (non-blocking)
    res.status(200).json({
      message: "OTP sent successfully. Please verify your email",
    });
    sendOTPEmail(email, otp).catch((err) =>
      console.log("OTP mail failed:", err)
    );

  } catch (error) {
    next(error);
  }
};