const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      default: "client",
    },
    address: { type: String },
    isVerified: { type: Boolean, default: true },
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
      from: String, 
      to: String, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
