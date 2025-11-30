const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

exports.authUser = async (req, res, next) => {
  console.log("auth user middleware triggered");
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // fetch from DB
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // now req.user._id is a valid ObjectId
    next();
  } catch (error) {
    res.status(400).json({ message: "invalid token" });
  }
};
