import Sale from "../../models/Sale.js";

// GET /sales

export const getAllSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name")
      .populate("items.medicine", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });

  } catch (error) {
    console.error("getAllSales error:", error);
    next(error);
  }
};