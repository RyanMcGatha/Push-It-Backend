const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = (email, token) => {
  const url = `https://push-it-backend.vercel.app/verify-email?token=${token}`;
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

        body {
            margin: 0;
            padding: 0;
            background-color: #161616;
            font-family: 'Inter', sans-serif;
            color: #e5e7eb;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #1f1f1f;
            border-radius: 8px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            position: relative;
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #2d2d2d;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #ffffff;
        }

        .content {
            padding: 20px 0;
            text-align: center;
            position: relative;
            z-index: 10;
        }

        .content h2 {
            margin: 0 0 20px;
            font-size: 28px;
            color: #ffffff;
        }

        .content p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #a1a1aa;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #1d4ed8;
        }

        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #2d2d2d;
            font-size: 12px;
            color: #6b7280;
        }

        .footer p {
            margin: 0;
        }

        .grid-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(30 58 138 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
            z-index: 0;
        }

        .gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(31, 31, 31, 0) 0%, #1f1f1f 100%);
            z-index: 5;
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="grid-background"></div>
        <div class="gradient-overlay"></div>
        <div class="header">
            <h1>Push It</h1>
        </div>
        <div class="content">
            <h2>Welcome to Push It!</h2>
            <p>Thank you for signing up for our app. Please click the button below to verify your email address:</p>
            <a href="${url}" class="button">Verify Email</a>
            <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
            <p><a href="${url}" style="color: #2563eb;">${url}</a></p>
            <p>If you did not sign up for this account, please ignore this email.</p>
            <p>Thank you,<br>The Push It Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Push It. All rights reserved.</p>
            <p>1234 Push It Street, Greenville, SC, 29601</p>
        </div>
    </div>
</body>
</html>
  `;

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Verify your email",
    html: htmlContent,
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
