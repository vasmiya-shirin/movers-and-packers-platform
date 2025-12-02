const ContactMessage = require("../models/contactMessageModel");

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      message,
      user: req.user?.id || null, // if logged-in store user
    });

    res.status(200).json({ message: "Message sent successfully", data: newMessage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllContactMessage=async (req,res)=>{
    try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}