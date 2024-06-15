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
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #161616;
            margin: 0;
            padding: 0;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1f1f1f;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 100px;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content img {
            max-width: 100%;
            height: auto;
        }
        .content h2 {
            font-size: 24px;
            color: #a3f9b9;
        }
        .content p {
            font-size: 16px;
            color: #dcdcdc;
            line-height: 1.5;
            margin: 20px 0;
        }
        .button {
            text-align: center;
            margin: 20px 0;
        }
        .button a {
            background-color: #32CD32;
            color: #ffffff;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 14px;
            color: #999999;
        }
        .footer a {
            color: #32CD32;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://culprtwibjtsfvuvbeor.supabase.co/storage/v1/object/public/other/pushitSlogan.png" alt="Push It Logo">
        </div>
        <div class="content">
            <h2>Verify your email address</h2>
            <p>You're one step away from completing your profile and starting to use Push It. Please verify your email address to get started.</p>
            <div class="button">
                <a href="${url}">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, copy and paste the URL below into your browser:</p>
            <p><a href="${url}" style="color: #32CD32;">${url}</a></p>
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

const sendPasswordResetEmail = (email, token) => {
  const url = `https://push-it-backend.vercel.app/reset-password/${token}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #161616;
            margin: 0;
            padding: 0;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1f1f1f;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 100px;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content img {
            max-width: 100%;
            height: auto;
        }
        .content h2 {
            font-size: 24px;
            color: #a3f9b9;
        }
        .content p {
            font-size: 16px;
            color: #dcdcdc;
            line-height: 1.5;
            margin: 20px 0;
        }
        .button {
            text-align: center;
            margin: 20px 0;
        }
        .button a {
            background-color: #32CD32;
            color: #ffffff;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 14px;
            color: #999999;
        }
        .footer a {
            color: #32CD32;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://culprtwibjtsfvuvbeor.supabase.co/storage/v1/object/public/other/pushitSlogan.png" alt="Push It Logo">
        </div>
        <div class="content">
            <h2>Reset your password</h2>
            <p>You're receiving this email because you requested a password reset for your Push It account. Please click the button below to reset your password.</p>
            <div class="button">
                <a href="${url}">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste the URL below into your browser:</p>
            <p><a href="${url}" style="color: #32CD32;">${url}</a></p>
        </div>
    </div>
</body>
</html>
  `;

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Reset your password",
    html: htmlContent,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Password reset email sent");
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
    });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
