import User from "../../models/User.js";
import { tempUsers } from "../../utils/tempStore.js";

export const verifyOTP = async (req, res, next) => {
  try {
    let { email, otp } = req.body;

    // ===== Normalize =====
    email = email?.toLowerCase().trim();

    // ===== get temp data =====
    const tempUser = tempUsers.get(email);

    if (!tempUser) {
      return res.status(400).json({
        message: "Signup expired. Try again"
      });
    }

    if (Date.now() > tempUser.otpExpiry) {
      tempUsers.delete(email);
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (String(tempUser.otp) !== String(otp)) {
      tempUser.attempts = (tempUser.attempts || 0) + 1;

      if (tempUser.attempts >= 5) {
        tempUsers.delete(email);

        return res.status(429).json({
          message: "Too many invalid OTP attempts. Please signup again"
        });
      }

      tempUsers.set(email, tempUser);

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // ===== Duplicate check =====
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone: tempUser.phone });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (phoneExists) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    // ===== Save user =====
    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password, // ✅ already hashed
      role: tempUser.role,
      address: tempUser.address, // 🔥 added
      isVerified: true,
      status: tempUser.role === "admin" ? "approved" : "pending"
    });

    // ===== delete temp =====
    tempUsers.delete(email);

    return res.status(201).json({
      message: "Signup successful",
      userId: user._id
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return next(error);
  }
};