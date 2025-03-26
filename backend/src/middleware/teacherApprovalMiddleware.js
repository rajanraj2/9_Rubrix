const User = require("../models/user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const approveTeacher = async (req, res, next) => {
    // const { email } = req.body;

  console.log("🔍 Request Body in admin's teacher-approval-middleware :", req.body);
  
  const {teacherId} = req.body;

  console.log("🔍 Teacher ID:", teacherId);

  if (!teacherId){
    return res.status(400).json({ message: "Teacher ID is required" });
  }
  
  const teacher = await User.findById(new mongoose.Types.ObjectId(teacherId));

    if (!teacher || teacher.role !== "pending") {
      return res.status(404).json({ message: "Teacher not found or already approved." });
    }
   
  teacher.role = "teacher";
  
  
  
  // teacher.pin = await bcrypt.hash(teacher.pin, 10);


  await teacher.save();
 
  res.status(200).json({ message: "Teacher registration approved successfully.", teacher });
};

const rejectTeacher = async (req, res, next) => {
  
  const {teacherId} = req.body;

  if (!teacherId){
    return res.status(400).json({ message: "Teacher ID is required" });
  }

  const teacher = await User.findById(new mongoose.Types.ObjectId(teacherId));

  if (!teacher || teacher.role !== "pending") {
    return res.status(404).json({ message: "Teacher not found or already approved." });
  }

  await User.findByIdAndDelete(teacherId);
  
  res.status(200).json({ message: "Teacher registration has been rejected by the Admin." });
}

module.exports = {approveTeacher, rejectTeacher};