import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sender = {
  email: process.env.EMAIL_FROM,
  name: "A Pharmacy",
};

// =============================
// OTP EMAIL
// =============================
export const sendOTPEmail = async (email, otp) => {
  try {
    await apiInstance.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: `Email verification code: ${otp} - OTP Valid for 5 Minutes`,
      textContent: `Dear User,

Thank you for signing up with us!

Your OTP is: ${otp}

Valid for 5 minutes.

Regards,
New Drug Team`,
    });

    console.log("OTP mail sent to:", email);
    return true;
  } catch (error) {
    console.error("OTP MAIL ERROR:", error);
    return false;
  }
};

// =============================
// ORDER PLACED EMAIL
// =============================
export const sendOrderPlacedEmail = async (email, order) => {
  try {
    await apiInstance.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "Order Received (Pending Approval)",
      textContent: `Dear ${order.user.name},

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
    console.error("Order placed mail error:", error);
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
        message =
          "Great news! Your order has been successfully accepted.\n\nWe are preparing your items for shipment.";
        break;

      case "rejected":
        subject = "Order Rejected";
        message =
          "Unfortunately, your order has been rejected.\n\nPlease contact support if needed.";
        break;

      case "delivered":
        subject = "Order Delivered";
        message =
          "Your order has been delivered successfully.\n\nThank you for choosing New Drug!";
        break;

      default:
        return;
    }

    await apiInstance.sendTransacEmail({
      sender,
      to: [{ email }],
      subject,
      textContent: `Dear ${order.user.name},

${message}

Order ID: ${order._id}
Total Amount: ₹${order.grandTotal}
Status: ${order.status}

Regards,
New Drug Team`,
    });

    console.log("Order status mail sent:", email);
  } catch (error) {
    console.error("Order status mail error:", error);
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

    await apiInstance.sendTransacEmail({
      sender,
      to: [{ email }],
      subject,
      textContent: `Dear ${user.name},

${message}

Account Status: ${user.status}

Regards,
New Drug Team`,
    });

    console.log("User status mail sent:", email);
  } catch (error) {
    console.error("User status mail error:", error);
  }
};