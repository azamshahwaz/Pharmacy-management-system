import Payment from "../../models/Payment.js";

export const getPaymentHistory = async (req, res, next) => {
  try {

    const allPayments = await Payment.find({});

    const payments = await Payment.find({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      payments,
    });

  } catch (error) {
    next(error);
  }
};