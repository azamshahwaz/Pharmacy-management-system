import { body } from "express-validator";

export const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid phone number"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("role")
    .isIn(["admin", "staff", "customer"])
    .withMessage("Invalid role"),
];

export const loginValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid phone number"),
];

export const verifyOTPValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  body("otp")
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage("Invalid OTP"),
];

export const resendOTPValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
];

export const verifyResetOTPValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  body("otp")
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage("Invalid OTP"),
];

export const resetPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];