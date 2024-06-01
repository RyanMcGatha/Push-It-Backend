const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, // Use port 465 for implicit TLS
  secure: true, // Set secure to true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true, // Enable logging
  debug: true, // Enable debug output
  connectionTimeout: 10000, // 10 seconds timeout for connections
  greetingTimeout: 10000, // 10 seconds timeout for greeting
  socketTimeout: 10000, // 10 seconds timeout for socket
});

const sendVerificationEmail = (email, token) => {
  console.log(`Sending verification email to: ${email} with token: ${token}`);
  const url = `https://push-it-backend.vercel.app/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${url}">here</a> to verify your email</p>`,
  };

  console.log("Mail Options:", mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = {
  sendVerificationEmail,
};
