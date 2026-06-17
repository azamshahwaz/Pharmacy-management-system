import express from "express";
import { createSale, getAllSales } from "../controllers/saleController/index.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "staff"),
  createSale
);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "staff"),
  getAllSales
);

export default router;