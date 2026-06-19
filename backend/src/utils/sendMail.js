const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async (to, subject, textContent) => {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "New Drug",
      },
      to: [{ email: to }],
      subject,
      textContent,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${err}`);
  }

  return response.json();
};

// =============================
// OTP EMAIL
// =============================
export const sendOTPEmail = async (email, otp) => {
  try {
    await sendEmail(
      email,
      `Email verification code: ${otp} - OTP Valid for 5 Minutes`,
      `Dear User,

Thank you for signing up with us!

Your OTP is: ${otp}

Valid for 5 minutes.

Regards,
New Drug Team`
    );
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
    await sendEmail(
      email,
      "Order Received (Pending Approval)",
      `Dear ${order.user.name},

Your order has been successfully placed!

Order ID: ${order._id}
Total Amount: ₹${Number(order.grandTotal).toFixed(2)}
Status: Pending Approval

Your order is currently under review by our team.
You will be notified once it is accepted or rejected.

Thank you for choosing New Drug.

Regards,
New Drug Team`
    );
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
    const statusMap = {
      accepted: {
        subject: "Order Approved",
        message:
          "Great news! Your order has been successfully accepted.\n\nWe are preparing your items for shipment.",
      },
      rejected: {
        subject: "Order Rejected",
        message:
          "Unfortunately, your order has been rejected.\n\nPlease contact support if needed.",
      },
      delivered: {
        subject: "Order Delivered",
        message:
          "Your order has been delivered successfully.\n\nThank you for choosing New Drug!",
      },
    };

    const entry = statusMap[order.status];
    if (!entry) return;

    await sendEmail(
      email,
      entry.subject,
      `Dear ${order.user.name},

${entry.message}

Order ID: ${order._id}
Total Amount: ₹${Number(order.grandTotal).toFixed(2)}
Status: ${order.status}

Regards,
New Drug Team`
    );
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
    const statusMap = {
      approved: {
        subject: "Account Approved",
        message: `Great news! Your account has been successfully approved.

You can now log in and start using our services.

Thank you for choosing New Drug — we're happy to have you onboard!`,
      },
      rejected: {
        subject: "Account Rejected",
        message: `We regret to inform you that your account has been rejected.

This may be due to invalid or incomplete details.

Please contact support for assistance.`,
      },
    };

    const entry = statusMap[user.status];
    if (!entry) return;

    await sendEmail(
      email,
      entry.subject,
      `Dear ${user.name},

${entry.message}

Account Status: ${user.status}

Regards,
New Drug Team`
    );
    console.log("User status mail sent:", email);
  } catch (error) {
    console.error("User status mail error:", error);
  }
};