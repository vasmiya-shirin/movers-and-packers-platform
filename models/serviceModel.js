const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: String, required: true },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availableLocations: [ String ],
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Service", serviceSchema);
