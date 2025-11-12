const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedpassword, role });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "user not found" });

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token);
    return res.status(200).json({ message: "login successfull", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.getAllusers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ message: "success", data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "failed", error: "Data not found" });
    }

    return res.status(200).json({ message: "success", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Check current user (verify token)
exports.checkUser = async (req, res) =>{
    try {
    res.status(200).json({ user: req.user, message: "User authenticated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Logout
exports.logout = async (req, res) =>{
    try {
     res.status(200).json({ message: "Logout successful (remove token client-side)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
