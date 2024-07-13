const otps = require("../models/otps");
const users = require("../models/users");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your OTP Code to Vote for FashionTV Creators Award!",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #D45D00;">Cast Your Vote with Gover!</h2>
        <p>Thank you for participating in the FashionTV Creators Award! We’re excited to have you vote for your favorite candidates.</p>
        <p>Your one-time password (OTP) for secure voting is:</p>
        <h3 style="font-weight: bold; font-size: 24px;">${otpCode}</h3>
        <p>This OTP is valid for only 5 minutes. Please use it promptly!</p>
        <p><a href="https://gover-client.vercel.app/otp" style="color: #D45D00; text-decoration: none;">Click here to verify your OTP and cast your vote!</a></p>
        <p>If you didn’t request this OTP, feel free to disregard this message.</p>
        <footer style="margin-top: 20px; font-size: 12px; color: #777;">
          <p>Best wishes,</p>
          <p>The Gover Team</p>
        </footer>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const otpGenerator = async (req, res) => {
  const { email } = req.body;

  const userRecord = await users.findOne({ email });

  if (userRecord) {
    var token = jwt.sign({ userId: userRecord._id }, process.env.JWT_SECRET, {
      expiresIn: "1D",
    });
    return res.status(200).json({
      success: true,
      data: token,
      message: "login",
    });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const userNumber = await otps.findOne({ email });

  if (userNumber) {
    await otps.updateOne(
      { email },
      { $set: { otp: otpCode, createdAt: new Date() } }
    );
    const newOtp = await otps.findOne({ email });
    await sendOtpEmail(email, otpCode);
    return res.status(200).json({
      success: true,
      data: newOtp,
      message: "otp",
    });
  }
  const otp = new otps({
    email,
    otp: otpCode,
    createdAt: new Date(),
  });

  const sendData = await otp.save();

  await sendOtpEmail(email, otpCode);
  return res.status(200).json({
    success: true,
    data: sendData,
    message: "otp",
  });
};

const otpValidation = async (req, res) => {
  const { email, otp } = req.body;

  const otpRecode = await otps.findOne({ email, otp });

  if (!otpRecode) {
    return res.status(400).json({ success: false, message: "Invalid OTP " });
  }

  const currentTime = new Date();
  const otpTime = new Date(otpRecode.createdAt);
  const differentMinutes = Math.floor((currentTime - otpTime) / 1000 / 60);

  if (differentMinutes > 5) {
    return res.status(400).json({ success: false, message: ` OTP expired ` });
  }

  await otps.deleteOne({ email, otp });
  const newUser = new users({
    email: email,
  });
  const user = await newUser.save();
  var token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });

  return res.status(200).json({
    success: true,
    data: token,
    message: "OTP verified successfully ",
  });
};

module.exports = { otpGenerator, otpValidation };
