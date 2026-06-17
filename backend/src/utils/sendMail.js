import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import nodemailer from "nodemailer";

// ✅ GLOBAL transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});
transporter.verify((error) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP Ready");
  }
});

// =============================
// ✅ OTP EMAIL
// =============================
export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Email verification code: ${otp} – OTP Valid for 5 Minutes`,
      text: `Dear User,

Thank you for signing up with us!

Your OTP is: ${otp}

Valid for 5 minutes.

Regards,
New Drug Team`,
    });
    return true;
    
  } catch (error) {
  console.log("MAIL ERROR:", error);
  return false;
}
};


// =============================
// ✅ ORDER PLACED EMAIL
// =============================
export const sendOrderPlacedEmail = async (email, order) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Order Received (Pending Approval)",
      text: `Dear ${order.user.name},

Your order has been successfully placed!

Order ID: ${order._id}
Total Amount: ₹${order.grandTotal}
Status: Pending Approval

Your order is currently under review by our team.
You will be notified once it is accepted or rejected.

Thank you for choosing New Drug.

Regards,
New Drug Team`,
    });
  } catch (error) {
    console.log("mail error:", error.message);
  }
};


// =============================
// ✅ ORDER STATUS EMAIL
// =============================
export const sendOrderStatusEmail = async (email, order) => {
  try {
    let subject = "";
    let message = "";

    switch (order.status) {
      case "accepted":
        subject = "Order Approved";
        message = `Great news! Your order has been successfully accepted.

We are preparing your items for shipment.`;
        break;

      case "rejected":
        subject = "Order Rejected";
        message = `Unfortunately, your order has been rejected.

Please contact support if needed.`;
        break;

      case "delivered":
        subject = "Order Delivered";
        message = `Your order has been delivered successfully.

Thank you for choosing New Drug!`;
        break;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: `Dear ${order.user.name},

${message}

Order ID: ${order._id}
Total Amount: ₹${order.grandTotal}
Status: ${order.status}

Regards,
New Drug Team`,
    });
  } catch (error) {
    console.log("Error:", error.message);
  }
};


// =============================
// ✅ USER STATUS EMAIL (🔥 NEW)
// =============================
export const sendUserStatusEmail = async (email, user) => {
  try {
    let subject = "";
    let message = "";

    switch (user.status) {
      case "approved":
        subject = "Account Approved";
        message = `Great news! Your account has been successfully approved.

You can now log in and start using our services.

Thank you for choosing New Drug — we’re happy to have you onboard!`;
        break;

      case "rejected":
        subject = "Account Rejected";
        message = `We regret to inform you that your account has been rejected.

This may be due to invalid or incomplete details.

Please contact support for assistance.`;
        break;

      default:
        return; // ❌ no mail for other statuses
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: `Dear ${user.name},

${message}

Account Status: ${user.status}

Regards,
New Drug Team`,
    });

  } catch (error) {
    console.log("User status mail error:", error.message);
  }
};