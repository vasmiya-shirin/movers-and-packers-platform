const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    pickupLocation: { type: String, required: true, trim: "true" },
    dropLocation: { type: String, required: true, trim: "true" },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "In Progress",
        "Completed",
        "Approved",
        "Cancelled",
      ],
      default: "Pending",
    },

    adminApproval: {
      type: Boolean,
      default: false,
    },

    totalPrice: {
      type: Number,
      min: [0, "Total price must be positive"],
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    trackingStatus: {
      type: String,
      enum: [
        "Booked",
        "Packing Started",
        "In Transit",
        "Out for Delivery",
        "Delivered",
      ],
      default: "Booked",
    },

    trackingHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
