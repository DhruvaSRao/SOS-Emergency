const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    dispatchId: {
      type: String,
      required: true,
      unique: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude first then ->, latitude]
        required: true
      }
    },

    audioUrl: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["Verification Pending", "Dispatched", "Resolved"],
      default: "Verification Pending"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
sosSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOS", sosSchema);