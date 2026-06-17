import express from "express";
import puppeteer from "puppeteer";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(
      req.params.id
    ).populate("user");
    if (
      order.user &&
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    if (!order) {
      const error = new Error(
        "Order not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    const html = `
      <html>
        <body>
          <h1>Invoice</h1>
          <p>Order ID: ${order._id}</p>
          <p>Name: ${order.user?.name || "N/A"}</p>
        </body>
      </html>
    `;

    const browser =
      await puppeteer.launch({
        args: ["--no-sandbox"],
      });

    try {
      const page =
        await browser.newPage();

      await page.setContent(html);

      const pdf =
        await page.pdf({
          format: "A4",
        });

      res.set({
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename=invoice-${order._id}.pdf`,
      });

      res.send(pdf);

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error(
      "Invoice PDF Error:",
      error
    );

    next(error);
  }
});

export default router;