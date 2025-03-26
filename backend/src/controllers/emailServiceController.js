const { sendVerificationEmail } = require("../utils/emailService");

const verificationCodes = new Map(); // Temporary storage (use Redis for production)

const sendAuthCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    verificationCodes.set(email, { code, expiresAt: Date.now() + 300000 }); // Code expires in 5 mins

    await sendVerificationEmail(email, code);
    res.status(200).json({ message: "Verification code sent successfully." });

  } catch (error) {
    res.status(500).json({ message: "Error sending email", error });
  }
};

const verifyAuthCode = (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData || storedData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Code expired. Request a new one." });
    }

    if (storedData.code != code) {
      return res.status(400).json({ message: "Invalid code!" });
    }

    verificationCodes.delete(email);
    res.status(200).json({ message: "Email verified successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Error verifying code", error });
  }
};

module.exports = { sendAuthCode, verifyAuthCode };
