import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

import makePayment from
  "../controllers/paymentController/makePayment.js";

import {
  verifyPayment,
} from
  "../controllers/paymentController/verifyPayment.js";

import {
  updatePayment,
} from
  "../controllers/paymentController/updatePayment.js";

import {
  getPaymentHistory,
} from "../controllers/paymentController/paymentHistory.js";

const router = express.Router();

// CREATE PAYMENT ORDER (CUSTOMER)
router.post("/create-order", protect, authorizeRoles("customer"),makePayment);

// VERIFY PAYMENT (CUSTOMER)
router.post("/verify-payment", protect, authorizeRoles("customer"), verifyPayment);

// PAYMENT HISTORY (CUSTOMER)

router.get("/history", protect, authorizeRoles("customer"), getPaymentHistory);

// UPDATE PAYMENT (ADMIN / STAFF)


router.put("/:id", protect, authorizeRoles("admin", "staff"), updatePayment);

export default router;