import Medicine from "../../models/Medicine.js";

const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Check ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    // 2. Delete medicine
    const medicine = await Medicine.findByIdAndDelete(id);

    // 3. Not found
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // 4. Success response
    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
      data: medicine,
    });

  } catch (error) {
    console.error("DELETE MEDICINE ERROR:", error);
    return next(error);
  }
};

export default deleteMedicine;