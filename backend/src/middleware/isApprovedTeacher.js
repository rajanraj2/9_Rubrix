const Teacher = require("../models/user.model");

const isApprovedTeacher = async (req, res, next) => {
    const {email, pin} = req.body;
    if(!email || !pin) return res.status(400).json({ message: "Email and PIN are required" });

    const teacher = await Teacher.findOne({ email });
    // if (!teacherId) return res.status(400).json({ message: "Teacher ID is required" });
    // const teacher = await Teacher.findById(new mongoose.Types.ObjectId(teacherId));
    if (!teacher ){
        return res.status(404).json({ message: "Teacher not found." });
    }
    console.log("teacher in middle:", teacher);
    
    if(teacher.role !== "teacher") {
        return res.status(404).json({ message: "Teacher not approved by the Admin." });
    }

    next();
}

module.exports = {isApprovedTeacher};