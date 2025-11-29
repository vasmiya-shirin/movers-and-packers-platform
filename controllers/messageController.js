const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, message } = req.body;

    if (!bookingId || !message) {
      return res.status(400).json({ message: "Booking ID and message are required" });
    }

    const msg = await Message.create({
      bookingId,
      message,
      sender: req.user._id,
    });

    res.status(200).json(msg);
  } catch (err) {
    console.error("SendMessage error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const messages = await Message.find({ bookingId })
      .sort("createdAt")
      .populate("sender", "name profilePic"); // optional: show sender info

    res.status(200).json(messages);
  } catch (err) {
    console.error("GetMessages error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



