const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");


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
      isVerifiedProvider: role === "provider" ? false : true,
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


//Forgot Password: Generate OTP (No email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Returning OTP directly (since no email)
    res.json({
      message: "OTP generated successfully",
      otp,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetOtp: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Generate a temporary reset token (valid for 10 minutes)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({
      message: "OTP verified",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken)
      return res.status(400).json({ message: "Token missing" });

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear OTP fields
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
