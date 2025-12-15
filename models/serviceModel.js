const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Title must be at least 3 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description too long"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be positive"],
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availableLocations: {
    type: [String],
    default: [],
  },
  availability: [Date],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Service", serviceSchema);
