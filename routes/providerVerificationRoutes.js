const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const User = require("../models/userModel");

// 📤 Upload verification documents
router.post("/provider/verify", authUser, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Assume multer/cloud upload already handled
    const files = req.files?.map((f) => f.path) || [];

    const provider = await User.findById(req.user._id);
    provider.verificationDocs = files;
    provider.verificationStatus = "pending";
    provider.isVerifiedProvider = false;

    await provider.save();

    res.json({ message: "Documents uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
