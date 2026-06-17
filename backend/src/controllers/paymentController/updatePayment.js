import Payment from "../../models/Payment.js";

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      const error = new Error(
        "Valid payment amount is required"
      );
      error.statusCode = 400;
      return next(error);
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      return next(error);
    }

    // Add paid amount
    payment.amountPaid += Number(amount);

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated",
      data: payment,
    });

  } catch (error) {
    console.error("updatePayment error:", error);
    next(error);
  }
};