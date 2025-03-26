const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILSERVICE_USER,
    pass: process.env.EMAILSERVICE_PASS,
  },
});
console.log("✅ Email Service Connected");
console.log("✅ Email Service User:", process.env.EMAILSERVICE_USER);
console.log("✅ Email Service Pass:", process.env.EMAILSERVICE_PASS);
const sendVerificationEmail = async (email, code) => {
  try {
    
    const mailOptions = {
      from: process.env.EMAILSERVICE_USER,
      to: email,
      subject: "Your Authentication Code for Registration",
      text: `Your authentication code is: ${code}. Use this to complete your registration.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification code sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendVerificationEmail };
