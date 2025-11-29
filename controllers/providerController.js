const User = require("../models/userModel");

exports.updateAvailability = async (req, res) => {
  try {
    const { availableLocations, startTime, endTime, days } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        availableLocations,
        availability: { startTime, endTime, days },
      },
      { new: true }
    );

    res.json({ message: "Availability updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadVerificationDocs = async (req, res) => {
  try {
    const files = req.files.map((f) => f.path); // cloudinary / multer path

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        verificationDocs: files,
        isVerifiedProvider: false, // stays pending
      },
      { new: true }
    );

    res.json({ message: "Documents uploaded", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
