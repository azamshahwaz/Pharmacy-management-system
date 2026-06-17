import Order from "../../models/Order.js";

export const getPendingOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("getPendingOrders error:", error);
    next(error); // ✅ Global Error Handler ko pass
  }
};