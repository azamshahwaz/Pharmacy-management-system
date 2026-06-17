import mongoose from "mongoose";
import { formatDateTime } from "../utils/formatDate.js";

// 🛒 Cart Item Schema
const cartItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

// 👤 User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
  type: String,
  enum: ["admin", "staff", "customer"],
  default: "customer",
},

totalOrders: {
  type: Number,
  default: 0,
},

totalSpent: {
  type: Number,
  default: 0,
},

membership: {
  type: String,
  enum: [
    "Standard",
    "Silver",
    "Gold",
    "Platinum",
  ],
  default: "Standard",
},

avatar: {
  type: String,
  default: "",
},

    address: {
      shopName: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
      street: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
      city: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
    },

savedAddresses: [
  {
    label: {
      type: String,
      enum: ["Home", "Office", "Work","Other"],
      default: "Home",
    },

    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
],

    // 🛒 Cart (FIXED + CONNECTED)
    cart: {
      type: [cartItemSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

  // 🧹 Soft delete
  isDeactivated: {
  type: Boolean,
  default: false,
},

deletionRequested: {
  type: Boolean,
  default: false,
},

    deleteAt: {
      type: Date,
      default: null,
    },

    actionBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      actionAt: Date,
    },

    isBlocked: {

      type: Boolean,

      default: false,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
    },

    notificationSettings: {

      emailNotifications: {
        type: Boolean,
        default: true,
      },

      pushNotifications: {
        type: Boolean,
        default: false,
      },

      orderAlerts: {
        type: Boolean,
        default: true,
      },

      smsNotifications: {
        type: Boolean,
        default: false,
      },
    },

    paymentSettings: {

  preferredMethod: {
    type: String,
    enum: ["upi", "card", "cash"],
    default: "upi",
  },

  upiId: {
    type: String,
    default: "",
  },

  preferredCardName: {
    type: String,
    default: "",
  },

  allowCOD: {
    type: Boolean,
    default: true,
  },

  savePaymentHistory: {
    type: Boolean,
    default: true,
  },

  paymentNotifications: {
    type: Boolean,
    default: true,
  },
},
    // 🔐 OTP
    otp: Number,
    otpExpiry: Date,

    resetOTP: String,
    resetOTPExpire: Date,

    wrongPasswordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// ✅ PARTIAL UNIQUE INDEX
// ===============================
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $ne: "rejected" },
    },
  }
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $ne: "rejected" },
    },
  }
);

// ===============================
// ✅ TTL AUTO DELETE
// ===============================
userSchema.index(
  { deleteAt: 1 },
  { expireAfterSeconds: 0 }
);

// ===============================
// ✅ DATE FORMAT
// ===============================
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.createdAt) ret.createdAt = formatDateTime(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = formatDateTime(ret.updatedAt);

    if (ret.actionBy?.actionAt) {
      ret.actionBy.actionAt = formatDateTime(ret.actionBy.actionAt);
    }

    return ret;
  },
});

// ===============================
// ✅ OVERWRITE-SAFE MODEL
// ===============================
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;