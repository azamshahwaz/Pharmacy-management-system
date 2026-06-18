import dns from "dns";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Loaded" : "Missing"
);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("GMAIL VERIFY ERROR:", error);
  } else {
    console.log("GMAIL SMTP READY");
  }
});

const FROM_EMAIL = `A Pharmacy <${process.env.EMAIL_USER}>`;

// =============================
// OTP EMAIL
// =============================
export const sendOTPEmail = async (email, otp) => {
  try {
   const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Email verification code: ${otp} - OTP Valid for 5 Minutes`,
      text: `Dear User,

Thank you for signing up with us!

Your OTP is: ${otp}

Valid for 5 minutes.

Regards,
New Drug Team`,
    });
    console.log("MESSAGE ID:", info.messageId);

    console.log("OTP mail sent to:", email);
    return true;
  } catch (error) {
    console.log("MAIL ERROR:", error);
    console.log("FULL ERROR:", JSON.stringify(error, null, 2));
    return false;
  }
};

// =============================
// ORDER PLACED EMAIL
// =============================
export const sendOrderPlacedEmail = async (email, order) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
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

    console.log("Order placed mail sent:", email);
  } catch (error) {
    console.log("Order placed mail error:", error);
  }
};

// =============================
// ORDER STATUS EMAIL
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

      default:
        return;
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
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

    console.log("Order status mail sent:", email);
  } catch (error) {
    console.log("Order status mail error:", error);
  }
};

// =============================
// USER STATUS EMAIL
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

Thank you for choosing New Drug — we're happy to have you onboard!`;
        break;

      case "rejected":
        subject = "Account Rejected";
        message = `We regret to inform you that your account has been rejected.

This may be due to invalid or incomplete details.

Please contact support for assistance.`;
        break;

      default:
        return;
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      text: `Dear ${user.name},

${message}

Account Status: ${user.status}

Regards,
New Drug Team`,
    });

    console.log("User status mail sent:", email);
  } catch (error) {
    console.log("User status mail error:", error);
  }
};