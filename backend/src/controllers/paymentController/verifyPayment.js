import crypto from "crypto";
import Payment from "../../models/Payment.js";

export const verifyPayment = async (
  req,
  res,
  next
) => {
  try {
    const {
      orderId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      const error = new Error(
        "Payment verification data is required"
      );
      error.statusCode = 400;
      return next(error);
    }

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    const isAuthentic =
      expectedSignature ===
      razorpay_signature;

    if (!isAuthentic) {
      const error = new Error(
        "Invalid Razorpay Signature"
      );
      error.statusCode = 400;
      return next(error);
    }

    await Payment.create({
      user: req.user._id,
      order: orderId,
      amount: Number(amount),
      amountPaid: Number(amount),
      dueAmount: 0,
      paymentMethod: "razorpay",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message:
        "Payment Verified Successfully",
    });

  } catch (error) {
    console.error(
      "verifyPayment error:",
      error
    );

    next(error);
  }
};