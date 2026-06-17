import Medicine from "../../models/Medicine.js";
import APIFeatures from "../../utils/apiFeatures.js";

const getAllMedicines = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Medicine.find(),
      req.query
    )
      .search(["productName", "productCategory"])
      .filter()
      .sort();

    const medicines = await features.query;

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });

  } catch (error) {
    console.error("GET ALL MEDICINES ERROR:", error);
    return next(error);
  }
};

export default getAllMedicines;