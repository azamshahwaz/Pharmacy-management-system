import mongoose from "mongoose";

const sessionSchema =
  new mongoose.Schema({

    user: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    device: {
      type: String,
      default: "Unknown Device",
    },

    browser: {
      type: String,
      default: "Unknown Browser",
    },

    os: {
      type: String,
      default: "Unknown OS",
    },

    ip: {
      type: String,
      default: "Unknown IP",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

  });

const Session =
  mongoose.model(
    "Session",
    sessionSchema
  );

export default Session;