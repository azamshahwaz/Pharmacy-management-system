import Order from "../../models/Order.js";
import ActivityLog from "../../models/Activitylog.js";
import { sendOrderStatusEmail } from "../../utils/sendMail.js";
import { getMembershipLevel } from "../../utils/membership.js";
import User from "../../models/User.js";

export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const user = req.user;

    const order = await Order.findById(orderId)
      .populate("user.userId");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    const allowedStatuses = [
      "pending",
      "accepted",
      "delivered",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    if (order.status === "delivered") {
      const error = new Error(
        "Order already delivered"
      );
      error.statusCode = 400;
      return next(error);
    }

    if (order.status === "rejected") {
      const error = new Error(
        "Rejected order cannot be updated"
      );
      error.statusCode = 400;
      return next(error);
    }

    const validTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["delivered"],
    };

    if (
      validTransitions[order.status] &&
      !validTransitions[order.status].includes(status)
    ) {
      const error = new Error(
        `Cannot change status from ${order.status} to ${status}`
      );
      error.statusCode = 400;
      return next(error);
    }

    // ==========================
    // Tumhara existing logic
    // ==========================

    order.status = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    const isCustomerOrder = Boolean(
      order.user?.address
    );

    if (isCustomerOrder) {
      order.actionBy = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        actionAt: new Date(),
      };

      if (status === "accepted") {
        order.acceptedBy = {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          actionAt: new Date(),
        };
      }

      if (status === "rejected") {
        order.rejectedBy = {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          actionAt: new Date(),
        };
      }

      if (status === "delivered") {
        order.deliveredBy = {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          actionAt: new Date(),
        };
      }
    }

order.status = status;

await order.save();


    if (status === "delivered") {
      const customer = await User.findById(
        order.user.userId
      );

      if (customer) {
        customer.totalOrders =
          (customer.totalOrders || 0) + 1;

        customer.totalSpent =
          (customer.totalSpent || 0) +
          order.grandTotal;

        customer.membership =
          getMembershipLevel(
            customer.totalOrders,
            customer.totalSpent
          );

        await customer.save();
      }
    }

    await ActivityLog.create({
      user: user._id,
      action: `ORDER_${status.toUpperCase()}`,
      targetId: order._id,
      targetType: "Order",
    });

    await ActivityLog.create({
      user: order.user.userId,
      action: `ORDER_${status.toUpperCase()}`,
      targetId: order._id,
      targetType: "Order",
    });

    try {
      if (order.user?.email) {
        await sendOrderStatusEmail(
          order.user.email,
          order
        );
      }
    } catch (err) {
      console.log(
        "Email failed but order updated"
      );
    }

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      data: order,
    });

  } catch (error) {
    console.error(
      "updateOrderStatus error:",
      error
    );

    next(error); // ✅ Global Error Handler
  }
};