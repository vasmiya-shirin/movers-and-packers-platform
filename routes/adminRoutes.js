// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");

// Get all unverified providers
router.get("/providers/pending", authUser, checkRole(["admin"]), async (req, res) => {
  try {
    const pendingProviders = await User.find({ role: "provider", isVerified: false });
    res.status(200).json({ pendingProviders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify / approve provider
router.put("/providers/verify/:id", authUser, checkRole(["admin"]), async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    provider.isVerified = true;
    await provider.save();

    res.status(200).json({ message: "Provider verified successfully", provider });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//Reject provider
router.delete("/providers/reject/:id",authUser, checkRole(["admin"]), async (req, res) =>{
  await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Provider rejected & removed" });
})

module.exports = router;
