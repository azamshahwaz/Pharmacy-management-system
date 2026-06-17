import Order from "../../models/Order.js";

export const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("actionBy", "name email phone");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: order,
      admin: order.actionBy || null,
    });

  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    next(error);
  }
};