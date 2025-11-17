const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authUser = (req, res, next) => {
  console.log("auth user middleware triggered");
  console.log("data : ", req.headers.authorization);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "authentication required" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // store user info in req
    next();
  } catch (error) {
    res.status(400).json({ message: "invalid token" });
  }
};
