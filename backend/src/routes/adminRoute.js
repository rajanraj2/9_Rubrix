const express = require('express');
const Teacher = require('../models/user.model');
const { approveTeacher, rejectTeacher } = require('../middleware/teacherApprovalMiddleware');
const { isAdmin } = require('../middleware/isAdminMiddleware');
const router = express.Router();

router.post('/approve-teacher', isAdmin, approveTeacher);
router.post('/reject-teacher', isAdmin, rejectTeacher);

router.get('/pending-teachers',isAdmin,  async (req, res) => {
    try{
        const pendingTeachers = await Teacher.find({role: "pending"});
        console.log("Pending Teachers Found:", pendingTeachers); 
        res.status(200).json( pendingTeachers || []);
    }
    catch(error){
        console.error("Error in fetching pending teachers:", error);
        res.status(500).json({ message: "Failed to fetch pending teachers" });
    }
});

router.post("/register-new-teacher", async (req, res) => {
    try {
      const { fullName, email, phoneNumber, schoolCollegeName, gender, state, collegeNumber, pin } = req.body;
  
      // ✅ Check if email is already registered
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ message: "Email already registered." });
      }
  
      // ✅ Create a new pending teacher entry
      const newTeacher = new Teacher({
        fullName,
        email,
        phoneNumber,
        schoolCollegeName,
        gender,
        state,
        collegeNumber,
        pin,
        role: "pending", // ✅ New teachers start as pending
      });
  
      await newTeacher.save();
      res.status(201).json({ message: "Registration submitted for approval!" });
    } catch (error) {
      console.error("Error registering teacher:", error);
      res.status(500).json({ message: "Server error. Registration failed." });
    }
  });
  
  


module.exports = router;