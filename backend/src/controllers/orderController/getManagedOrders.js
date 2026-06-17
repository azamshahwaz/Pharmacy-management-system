import Order from "../../models/Order.js";

export const getManagedOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // ✅ FIND ORDERS MANAGED BY CURRENT USER
    const orders = await Order.find({
      "actionBy.userId": userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Managed orders fetched successfully",
      orders,
    });

  } catch (error) {
    console.error(
      "GET MANAGED ORDERS ERROR:",
      error
    );

    return next(error);
  }
};