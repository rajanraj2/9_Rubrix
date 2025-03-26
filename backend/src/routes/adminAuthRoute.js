const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
require("dotenv").config();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ message: "Admin already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({

        email,
        password: hashedPassword
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
    res.status(500).json({ message: "Server error" });
    }
});
// Admin login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email});
    if (!admin ) return res.status(401).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { adminId: admin._id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Generated Token:", token); // ✅ Debugging Log

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    res.status(200).json({ admin });
  } catch (error) { 
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
