const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const sendEmail=require("../utility/sendEmail")

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 Upload to Cloudinary if file is sent
    let imageUrl = "";
    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "movers" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      imageUrl = uploaded.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      address,
      profilePic: imageUrl,
      isVerified: role === "provider" ? false : true,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "user not found" });

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.status(400).json({ message: "Invalid password" });

    if (user.role === "provider" && user.isVerified === false) {
      return res.status(403).json({
        message: "Your provider account is awaiting admin approval.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token);
    return res
      .status(200)
      .json({ message: "login successfull", token, user, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <p>Hello ${user.name || ""},</p>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}" target="_blank">${resetURL}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    const success = await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html,
    });

    if (!success) {
      return res.status(500).json({ message: "Email sending failed" });
    }

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.log("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }, // token valid?
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.updateLoggedInUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, address, phone, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        address,
        phone,
        profilePic, // <-- NOW IT WORKS
      },
      { new: true }
    );

    return res.json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Edit profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID (for provider info)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
exports.checkUser = async (req, res) => {
  try {
    res.status(200).json({ user: req.user, message: "User authenticated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Logout
exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Logout successful (remove token client-side)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//upload profilepic
exports.uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.id, { profilePic: imagePath });

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePic: imagePath,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
//check availability
exports.availabilityCheck = async (req, res) => {
  try {
    const { availableLocations, startTime, endTime, days } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        availableLocations,
        availability: {
          startTime,
          endTime,
          days,
        },
      },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};
