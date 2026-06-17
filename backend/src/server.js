import { logger } from "./utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import  connectDB  from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// API VERSION
// ===================================

const API_VERSION = "/api/v1";

// ===================================
// TRUST PROXY
// ===================================

app.set("trust proxy", 1);

// ===================================
// SECURITY
// ===================================

app.use(helmet());

app.use(compression());

// ===================================
// RATE LIMITING
// ===================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalLimiter);

// ===================================
// CORS
// ===================================

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

// ===================================
// BODY PARSER
// ===================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===================================
// COOKIE PARSER
// ===================================

app.use(cookieParser());

// ===================================
// HEALTH CHECK
// ===================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
    environment: process.env.NODE_ENV,
  });
});

// ===================================
// ROUTES
// ===================================
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/users`, userRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/orders`, orderRoutes);
app.use(`${API_VERSION}/sales`, saleRoutes);
app.use(`${API_VERSION}/medicines`, medicineRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);
app.use(`${API_VERSION}/invoices`, invoiceRoutes);
app.use(`${API_VERSION}/settings`, settingsRoutes);
app.use(`${API_VERSION}/addresses`, addressRoutes);

// ===================================
// 404 HANDLER
// ===================================

app.all("/*splat", (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// ===================================
// GLOBAL ERROR HANDLER
// ===================================

app.use((err, req, res, next) => {
  logger.error({
  message: err.message,
  stack: err.stack,
  method: req.method,
  url: req.originalUrl,
  ip: req.ip,
});

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongo Invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  // Mongo Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose Validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Something went wrong"
        : message,
  });
});

// ===================================
// PROCESS ERRORS
// ===================================

process.on("unhandledRejection", (err) => {
  logger.error({
    type: "UNHANDLED_REJECTION",
    message: err.message,
    stack: err.stack,
  });
});

process.on("uncaughtException", (err) => {
  logger.error({
    type: "UNCAUGHT_EXCEPTION",
    message: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

// ===================================
// START SERVER
// ===================================

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(
  `Server running on port ${PORT} (${process.env.NODE_ENV})`
);
    });
  })
  .catch((error) => {
    logger.error({
  message: "Database connection failed",
  error: error.message,
  stack: error.stack,
});
    process.exit(1);
  });