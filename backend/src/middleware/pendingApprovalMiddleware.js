const Teacher = require("../models/user.model");

// Register
const pendingTeacherApproval= async (req, res) => {
    const { fullName, email, phoneNumber, role, schoolCollegeName, collegeNumber, pin } = req.body;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
        return res.status(409).json({ message: "Teacher already exists" });
    }


    const newTeacher = new Teacher({ fullName, email, phoneNumber, role, schoolCollegeName, collegeNumber, pin });
    await newTeacher.save();

    res.status(201).json({ message: "Teacher registration is pending approval by the Admin." });
};

module.exports = { pendingTeacherApproval };