import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(

  {

    // =========================
    // USER
    // =========================

    user: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    // =========================
    // ORDER
    // =========================

    order: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "Order",

      required: true,
    },

    // =========================
    // TOTAL AMOUNT
    // =========================

    amount: {

      type: Number,

      required: true,
    },

    // =========================
    // PAID AMOUNT
    // =========================

    amountPaid: {

      type: Number,

      default: 0,
    },

    // =========================
    // DUE AMOUNT
    // =========================

    dueAmount: {

      type: Number,

      default: function () {

        return this.amount;
      },
    },

    // =========================
    // PAYMENT METHOD
    // =========================

    paymentMethod: {

      type: String,

      enum: [
        "razorpay",
        "cod",
      ],

      default: "razorpay",
    },

    // =========================
    // PAYMENT STATUS
    // =========================

    status: {

      type: String,

      enum: [
        "created",
        "pending",
        "partial",
        "success",
        "failed",
      ],

      default: "created",
    },

    // =========================
    // RAZORPAY DETAILS
    // =========================

    razorpay_order_id: {
      type: String,
    },

    razorpay_payment_id: {
      type: String,
    },

    razorpay_signature: {
      type: String,
    },

    // =========================
    // FAILURE MESSAGE
    // =========================

    failureReason: {
      type: String,
    },

    // =========================
    // REFUND STATUS
    // =========================

    refundStatus: {

      type: String,

      enum: [
        "none",
        "processing",
        "refunded",
      ],

      default: "none",
    },

  },

  {
    timestamps: true,
  }
);

// =========================
// AUTO PAYMENT STATUS
// =========================

paymentSchema.pre(
  "save",
  function (next) {

    this.dueAmount =
      this.amount - this.amountPaid;

    // FULL PAID
    if (this.dueAmount <= 0) {

      this.status = "success";
    }

    // PARTIAL PAID
    else if (this.amountPaid > 0) {

      this.status = "partial";
    }

    // NOT PAID
    else {

      this.status = "pending";
    }

    next();
  }
);

// =========================
// SAFE EXPORT
// =========================

const Payment =

  mongoose.models.Payment ||

  mongoose.model(
    "Payment",
    paymentSchema
  );

export default Payment;