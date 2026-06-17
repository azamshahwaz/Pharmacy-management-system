import Order from "../../models/Order.js";
import Medicine from "../../models/Medicine.js";
import User from "../../models/User.js";
import { sendOrderPlacedEmail } from "../../utils/sendMail.js";
import ActivityLog from "../../models/Activitylog.js";

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { items, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      const error = new Error("No items provided");
      error.statusCode = 400;
      return next(error);
    }

    // Merge duplicate items
    const map = new Map();

    items.forEach((item) => {
      if (!item.medicineId || !item.quantity) return;

      if (map.has(item.medicineId)) {
        map.get(item.medicineId).quantity += item.quantity;
      } else {
        map.set(item.medicineId, { ...item });
      }
    });

    const finalItems = Array.from(map.values());

    // Fetch user
    const user = await User.findById(userId).select(
      "name email phone role address"
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Role based status
    const orderStatus =
      user.role === "admin" || user.role === "staff"
        ? "accepted"
        : "pending";

    // Address validation
    if (user.role === "customer" && !user.address) {
      const error = new Error(
        "Please update your profile address first"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Fetch medicines
    const medicineIds = finalItems.map((i) => i.medicineId);

    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
    });

    const medicineMap = new Map();

    medicines.forEach((med) => {
      medicineMap.set(med._id.toString(), med);
    });

    let grandTotal = 0;
    const orderItems = [];

    // Process items
    for (const item of finalItems) {
      const medicine = medicineMap.get(
        item.medicineId.toString()
      );

      if (!medicine) {
        const error = new Error(
          `Medicine not found: ${item.medicineId}`
        );
        error.statusCode = 404;
        return next(error);
      }

      const mrp = medicine.mrp;
      const discount = medicine.discount || 0;
      const price = mrp - (mrp * discount) / 100;
      const expiryDate = medicine.expiryDate;

      const total = price * item.quantity;
      grandTotal += total;

      orderItems.push({
        medicineId: medicine._id,
        medicineName: medicine.productName,
        mrp,
        discount,
        price,
        quantity: item.quantity,
        expiryDate,
        total,
      });
    }

    // User snapshot
    const userData = {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(user.role === "customer" && {
        address: user.address,
      }),
    };

    // Generate Order ID
    const now = new Date();

    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();

    const datePrefix = `${dd}${mm}${yyyy}`;

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Order.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const serial = String(count + 1).padStart(2, "0");

    const orderId = `${datePrefix}${serial}`;

    // Create order
    const order = await Order.create({
      orderId,
      user: userData,
      items: orderItems,
      grandTotal,
      paymentMethod: paymentMethod || "cod",
      status: orderStatus,
    });

    // Activity Log
    await ActivityLog.create({
      user: user._id,
      action: "ORDER_PLACED",
      targetId: order._id,
      targetType: "Order",
    });

    // Email
    await sendOrderPlacedEmail(
      user.email,
      order
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });

  } catch (error) {
    console.error("placeOrder error:", error);
    next(error);
  }
};