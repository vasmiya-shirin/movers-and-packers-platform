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
    profilePic: {
      type: String, // Cloudinary image URL
      default: "", // Default empty string
    },
     // 🔐 PROVIDER VERIFICATION
    isVerifiedProvider: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    verificationDocs: {
      type: [String],
      default: [],
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
