const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: { type: String },
    otpExpires: { type: Date },
    phone: { type: String },
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      default: "client",
    },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    profilePic: {
      type: String, // Cloudinary image URL
      default: "", // Default empty string
    },
    verification: {
      idProof: String,
      license: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },
    availability: {
      days: [String],
      startTime: String,
      endTime: String,
    },
    availableLocations: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
