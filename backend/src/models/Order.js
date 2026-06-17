import mongoose from "mongoose";
import { formatDateTime } from "../utils/formatDate.js"; // ✅ ADDED

const orderSchema = new mongoose.Schema(
  {
    // 🆔 Custom Order ID
    orderId: {
      type: String,
      unique: true,
    },

    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      phone: String,
      role: String,

      address: {
        shopName: String,
        street: String,
        city: String,
      },
    },

    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        medicineName: String,
        mrp: Number,
        discount: Number,
        price: Number,
        quantity: Number,
        expiryDate: Date,
        total: Number,
      },
    ],

    grandTotal: Number,

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    // 📦 Order Status
    status: {
      type: String,
      enum: ["pending", "accepted", "delivered", "rejected"],
      default: "pending",
    },

    // ✅ Existing field (KEEP THIS)
    actionBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
      actionAt: Date,
    },

    // ✅ Staff who accepted order
    acceptedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
      actionAt: Date,
    },

    // ❌ Staff who rejected order
    rejectedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
      actionAt: Date,
    },

    // 🚚 Staff who delivered order
    deliveredBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
      actionAt: Date,
    },

    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

// ===============================
// ✅ DATE FORMAT (toJSON)
// ===============================
orderSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.createdAt) ret.createdAt = formatDateTime(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = formatDateTime(ret.updatedAt);

    if (ret.actionBy?.actionAt)
      ret.actionBy.actionAt = formatDateTime(ret.actionBy.actionAt);

    if (ret.acceptedBy?.actionAt)
      ret.acceptedBy.actionAt = formatDateTime(ret.acceptedBy.actionAt);

    if (ret.rejectedBy?.actionAt)
      ret.rejectedBy.actionAt = formatDateTime(ret.rejectedBy.actionAt);

    if (ret.deliveredBy?.actionAt)
      ret.deliveredBy.actionAt = formatDateTime(ret.deliveredBy.actionAt);

    if (ret.paidAt) ret.paidAt = formatDateTime(ret.paidAt);
    if (ret.deliveredAt) ret.deliveredAt = formatDateTime(ret.deliveredAt);

    return ret;
  },
});

// ===============================
// ✅ OVERWRITE-SAFE MODEL
// ===============================
const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;