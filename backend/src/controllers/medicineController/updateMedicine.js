import Medicine from "../../models/Medicine.js";

const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. ID check
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    // ✅ 2. Find medicine
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const updates = req.body;

    // ❌ Empty body check
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide fields to update",
      });
    }

    let updatedFields = [];

    // 🔍 Loop through updates
    for (const key in updates) {
      let isDifferent = false;

      // 🔥 EXPIRY DATE HANDLING
      if (
  key === "expiryDate" &&
  updates[key] !== undefined &&
  updates[key] !== null &&
  updates[key] !== ""
) {
  const parsedIncomingDate = new Date(
    updates[key]
  );

  if (
    isNaN(parsedIncomingDate.getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid expiry date",
    });
  }

  const incomingDate =
    parsedIncomingDate.toISOString();

  const existingDate =
    medicine[key]
      ? new Date(
          medicine[key]
        ).toISOString()
      : null;

  isDifferent =
    incomingDate !== existingDate;

  if (
    isDifferent &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Only admin can update expiry date",
    });
  }
} else {
        // ✅ normal field comparison
        isDifferent =
          updates[key] != medicine[key];
      }

      // 🔥 productName duplicate check
      if (
        key === "productName" &&
        isDifferent
      ) {
        const existing =
          await Medicine.findOne({
            productName: updates.productName,
          });

        if (
          existing &&
          existing._id.toString() !== id
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product name already exists",
          });
        }
      }

      // ✅ Update only changed fields
      if (isDifferent) {
        medicine[key] = updates[key];
        updatedFields.push(key);
      }
    }

    // ❌ No changes
    if (updatedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "All fields value is same, please change the value to update",
      });
    }

    // ✅ Save
    await medicine.save();

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: `${updatedFields.join(
        ", "
      )} updated successfully`,
      updatedFields,
      data: medicine,
    });

  } catch (error) {
    console.error(
      "UPDATE MEDICINE ERROR:",
      error
    );

    return next(error);
  }
};

export default updateMedicine;