const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");

// 🔍 Get pending providers
router.get(
  "/providers/pending",
  authUser,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const pendingProviders = await User.find({
        role: "provider",
        verificationStatus: "pending",
      }).select("-password");

      res.status(200).json({ pendingProviders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ Approve provider
router.put(
  "/providers/verify/:id",
  authUser,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const provider = await User.findById(req.params.id);
      if (!provider)
        return res.status(404).json({ message: "Provider not found" });

      provider.isVerifiedProvider = true;
      provider.verificationStatus = "approved";
      await provider.save();

      res.json({ message: "Provider approved successfully", provider });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//  Reject provider 
router.put(
  "/providers/reject/:id",
  authUser,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const provider = await User.findById(req.params.id);
      if (!provider)
        return res.status(404).json({ message: "Provider not found" });

      provider.isVerifiedProvider = false;
      provider.verificationStatus = "rejected";
      await provider.save();

      res.json({ message: "Provider rejected" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;

