const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },

    resetOtp: { type: String },
    otpExpires: { type: Date },
    phone: {
      type: String,
      match: [/^[0-9]{8,15}$/, "Please enter a valid phone number"],
    },

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
