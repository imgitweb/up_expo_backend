const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Automatically sets host to smtp.gmail.com & port
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // ⚠️ IMPORTANT: Use the 16-digit App Password here
  },
});

// Added 'attachments' to the destructured arguments
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: `"BVS STARTUP EXPO" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments, // ✅ Now passing the PDF attachment
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = { sendEmail };