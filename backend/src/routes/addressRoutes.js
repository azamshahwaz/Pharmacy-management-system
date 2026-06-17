import express from "express";
import {
  protect,
} from "../middleware/authMiddleware.js";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController/index.js";

const router = express.Router();

router.get("/", protect, getAddresses);

router.post("/", protect, addAddress);

router.put("/:id", protect, updateAddress);

router.delete("/:id", protect, deleteAddress);

export default router;