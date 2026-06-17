import express from "express";

import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getManagedOrders,
  getPendingOrders,
  markOrderPaid,
} from "../controllers/orderController/index.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router =
  express.Router();

// =========================
// PLACE ORDER
// =========================
router.post(
  "/",
  protect,
  placeOrder
);

// =========================
// MY ORDERS
// =========================
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// =========================
// ORDER STATS
// =========================
router.get(
  "/stats",
  protect,
  authorizeRoles(
    "admin",
    "staff"
  ),
  getOrderStats
);

// =========================
// MANAGED ORDERS
// =========================
router.get(
  "/managed-orders",
  protect,
  authorizeRoles(
    "admin",
    "staff"
  ),
  getManagedOrders
);

// =========================
// PENDING ORDERS
// =========================
router.get(
  "/pending-orders",
  protect,
  authorizeRoles(
    "admin",
    "staff"
  ),
  getPendingOrders
);

// =========================
// ALL ORDERS
// =========================
router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "staff"
  ),
  getAllOrders
);

// =========================
// MARK ORDER AS PAID
// =========================
router.put(
  "/:id/pay",
  protect,
  markOrderPaid
);

// =========================
// GET ORDER BY ID
// =========================
router.get(
  "/:id",
  protect,
  getOrderById
);

// =========================
// UPDATE STATUS
// =========================
router.put(
  "/:id/status",
  protect,
  authorizeRoles(
    "admin",
    "staff"
  ),
  updateOrderStatus
);



export default router;