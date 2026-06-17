import express from "express";
import { addMedicine, getAllMedicines, updateMedicine, deleteMedicine  } from "../controllers/medicineController/index.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "staff"), addMedicine);   
router.get("/", protect, getAllMedicines);
router.put("/:id", protect, authorizeRoles("admin", "staff"), updateMedicine);
router.delete("/:id", protect, authorizeRoles("admin", "staff"), deleteMedicine);

export default router;