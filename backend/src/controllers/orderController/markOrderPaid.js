import Order from "../../models/Order.js";

export const markOrderPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // =========================
    // MARK AS PAID
    // =========================

    order.isPaid = true;
    order.paymentStatus = "paid";
    order.paidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as paid",
      order,
    });
  } catch (error) {
    console.error("markOrderPaid error:", error);
    next(error);
  }
};