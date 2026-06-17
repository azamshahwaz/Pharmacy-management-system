import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [saleItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "card"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "partial", "due"],
    default: "pending"
  },

  orderStatus: {
    type: String,
    enum: ["pending", "accepted", "completed"],
    default: "pending"
  },

  billNumber: {
    type: String,
    unique: true
  },

  acceptedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

saleSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model("Sale").countDocuments();
    this.billNumber = `BILL-${count + 1}`;
  }
  next();
});

const Sale =
  mongoose.models.Sale || mongoose.model("Sale", saleSchema);

export default Sale;