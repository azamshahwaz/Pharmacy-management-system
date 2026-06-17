import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    
    manufacturer: {
      type: String
    },

    productCategory: {
      type: String,
      enum: ["tablet", "capsule", "syrup", "injection", "ointment", "drops", "iv_fluid", "medical_device", "surgical", "personal_care", "nutrition", "baby_care", "veterinary", "ayurvedic", "others"],
      required: true
    },

    mrp: {
      type: Number,
      default: 0,
      required: true
    },

    discount: {
      type: Number,
      default: 0,
      required: true
    },

    price: {
      type: Number,
      default: 0,
      required: true
    },

    expiryDate: {
      type: Date
    },

  },
  { timestamps: true,
    versionKey: false
   }
);

medicineSchema.index(
  { productName: 1, productCategory: 1 },
  { unique: true }
);

medicineSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.mrp || update.discount) {
    const mrp = update.mrp ?? this.getQuery().mrp;
    const discount = update.discount ?? this.getQuery().discount ?? 0;

    this.setUpdate({
      ...update,
      price: mrp - (mrp * discount) / 100
    });
  }

  next();
});

medicineSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.mrp || update.discount) {
    const mrp = update.mrp ?? this._update.mrp;
    const discount = update.discount ?? 0;

    this._update.price = mrp - (mrp * discount) / 100;
  }
  next();
});

const Medicine =
  mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);

export default Medicine;