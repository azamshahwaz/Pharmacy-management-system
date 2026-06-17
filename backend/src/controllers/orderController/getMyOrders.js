import Order from "../../models/Order.js";
import APIFeatures from "../../utils/apiFeatures.js";

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ✅ Base query (only logged-in user)
    let queryObj = {
      "user.userId": userId,
    };

    // 🔍 Search (orderId OR medicineName)
    if (req.query.search) {
      const keyword = req.query.search;

      queryObj.$or = [
        {
          _id: keyword.match(/^[0-9a-fA-F]{24}$/)
            ? keyword
            : null,
        },
        {
          "items.medicineName": {
            $regex: keyword,
            $options: "i",
          },
        },
      ].filter(Boolean);
    }

    // 📅 Date Range Filter
    if (req.query.startDate || req.query.endDate) {
      queryObj.createdAt = {};

      if (req.query.startDate) {
        queryObj.createdAt.$gte = new Date(
          req.query.startDate +
            "T00:00:00.000Z"
        );
      }

      if (req.query.endDate) {
        queryObj.createdAt.$lte = new Date(
          req.query.endDate +
            "T23:59:59.999Z"
        );
      }
    }

    // 🔥 Apply APIFeatures
    const features = new APIFeatures(
      Order.find(queryObj),
      req.query
    )
      .filter()
      .sort();

    const orders =
      await features.query.lean();

    // 🔢 Total count
    const total =
      await Order.countDocuments(
        queryObj
      );

    return res.status(200).json({
      success: true,
      results: orders.length,
      total,
      page:
        Number(req.query.page) || 1,
      data: orders,
    });

  } catch (error) {
    console.error(
      "GET MY ORDERS ERROR:",
      error
    );

    return next(error);
  }
};