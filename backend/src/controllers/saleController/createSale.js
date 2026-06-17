import Sale from "../../models/Sale.js";
import crypto from "crypto";

const generateBillNumber = () => {
  return `INV-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};

export const createSale = async (
  req,
  res,
  next
) => {
  try {
    const {
      customer,
      items,
      paymentMethod,
    } = req.body;

    // ==============================
    // Validation
    // ==============================
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    let totalAmount = 0;

    const saleItems = items.map(
      (item) => {
        const {
          medicine,
          quantity,
          price,
          discount = 0,
        } = item;

        if (
          !medicine ||
          !quantity ||
          !price
        ) {
          throw new Error(
            "Invalid sale item data"
          );
        }

        const totalPrice =
          Number(price) *
          Number(quantity);

        const discountAmount =
          (totalPrice *
            Number(discount)) /
          100;

        const itemTotal =
          totalPrice -
          discountAmount;

        totalAmount += itemTotal;

        return {
          medicine,
          quantity,
          price,
          discount,
          total: itemTotal,
        };
      }
    );

    // ==============================
    // Create Sale
    // ==============================
    const sale = await Sale.create({
      customer:
        customer || "Walk-in Customer",

      items: saleItems,

      totalAmount,

      paymentMethod:
        paymentMethod || "Cash",

      billNumber:
        generateBillNumber(),

      acceptedby:
        req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Sale created successfully",
      sale,
    });
  } catch (error) {
    console.error(
      "createSale error:",
      error
    );

    next(error);
  }
};