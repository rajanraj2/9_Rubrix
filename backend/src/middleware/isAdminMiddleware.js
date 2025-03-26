const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware to Protect Admin Routes
const isAdmin = (req, res, next) => {
  let token = req.headers.authorization; 
  console.log("🔍 Received Token:", token); 

  
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // ✅ Extract actual token
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Decoded Token:", decoded);

    
    if (!decoded || decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    console.log("req.admin:", decoded);

    req.admin = decoded; 
    next(); // Proceed to next middleware/route
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { isAdmin };
