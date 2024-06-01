const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = (email, token) => {
  console.log(`Sending verification email to: ${email} with token: ${token}`);
  const url = `https://push-it-backend.vercel.app/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>
    <button type="button" onClick=(${url})></button>
`,
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
