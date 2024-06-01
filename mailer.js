const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = (email, token) => {
  const url = `https://push-it-backend.vercel.app/verify-email?token=${token}`;
  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Verify your email",
    html: `<p>Click <a href="${url}">here</a> to verify your email</p>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
};

module.exports = {
  sendVerificationEmail,
};
