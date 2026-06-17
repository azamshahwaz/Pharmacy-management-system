import Medicine from "../../models/Medicine.js";

const addMedicine = async (req, res, next) => {
  try {
    // 1. Empty body check
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided",
      });
    }

    // 2. Required fields validation
    const requiredFields = [
      "productName",
      "productCategory",
      "mrp",
      "discount",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(
          ", "
        )} is required, please input that field`,
      });
    }

    // 3. Duplicate check
    const existing = await Medicine.findOne({
      productName: req.body.productName
        .trim()
        .toLowerCase(),
      productCategory: req.body.productCategory,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Medicine already exists",
      });
    }

    // 4. Clean data
    req.body.productName = req.body.productName
      .trim()
      .toLowerCase();

    // 5. Create medicine
    const medicine = await Medicine.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine,
    });

  } catch (error) {
    console.error("ADD MEDICINE ERROR:", error);
    return next(error);
  }
};

export default addMedicine;