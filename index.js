require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, query, validationResult } = require("express-validator");

const { sendVerificationEmail, sendPasswordResetEmail } = require("./mailer");
const {
  addUser,
  findUser,
  findUserByEmail,
  generatePasswordResetToken,
  updateProfilePic,
  findChatsByUsername,
  findUserProfile,
  getAllUsernames,
  getAllUserProfiles,
  updatePassword,
  verifyUserEmail,
  findUserByToken,
} = require("./users");
const { addChat, getMessages, addMessage, deleteChat } = require("./chats");

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

app.get("/", (req, res) => {
  res.send("root");
});

app.post(
  "/request-password-reset",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
      const token = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
      res.status(200).json({ message: "Password reset link sent to email" });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      res
        .status(500)
        .json({ message: "Error sending password reset email", error });
    }
  }
);

app.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, secretKey);
      const user = await findUserByEmail(decoded.email);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid token or user not found" });
      }

      const updatedUser = await updatePassword(user.username, newPassword);
      res.json({ message: "Password reset successfully", user: updatedUser });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password", error });
    }
  }
);

app.patch(
  "/profile-pic",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("profilePic")
      .notEmpty()
      .withMessage("Profile picture URL is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, profilePic } = req.body;
    try {
      const updatedUser = await updateProfilePic(username, profilePic);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res
        .status(500)
        .json({ message: "Error updating profile pic", error: error.message });
    }
  }
);

app.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("fullname").notEmpty().withMessage("Full name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullname } = req.body;
    try {
      const user = await addUser(username, email, password, fullname);
      sendVerificationEmail(email, user.verification_token);
      res.status(201).json({
        message: "Registration successful. Check your email for verification.",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user", error });
    }
  }
);

app.get(
  "/verify-email",
  query("token").notEmpty().withMessage("Token is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.query;
    try {
      const user = await findUserByToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid token" });
      }

      await verifyUserEmail(user.id);
      const updatedUser = await findUser(user.username);

      res.status(200).json({
        message: "Email verified successfully",
        user: {
          username: updatedUser.username,
          email: updatedUser.email,
          is_verified: updatedUser.is_verified,
        },
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Error verifying email", error });
    }
  }
);

app.post(
  "/resend-verification",
  body("username").notEmpty().withMessage("Username is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;
    try {
      const user = await findUser(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      sendVerificationEmail(user.email, user.verification_token);
      res.status(200).json({ message: "Verification email resent" });
    } catch (error) {
      console.error("Error resending verification email:", error);
      res.status(500).json({ message: "Error resending verification email" });
    }
  }
);

app.patch(
  "/update-password",
  authenticateToken,
  [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    try {
      const user = await findUser(req.user.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const updatedUser = await updatePassword(user.username, newPassword);
      res.json({ message: "Password updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Error updating password", error });
    }
  }
);

app.post(
  "/add-chat",
  [
    body("chat_name").notEmpty().withMessage("Chat name is required"),
    body("is_group").isBoolean().withMessage("is_group must be a boolean"),
    body("user_names").isArray().withMessage("user_names must be an array"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chat_name, is_group, user_names } = req.body;
    try {
      const chat = await addChat(chat_name, is_group, user_names);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Error creating chat", error });
    }
  }
);

app.post(
  "/add-message",
  [
    body("chat_id").notEmpty().withMessage("Chat ID is required"),
    body("message_text").notEmpty().withMessage("Message text is required"),
    body("user_name").notEmpty().withMessage("User name is required"),
    body("full_name").notEmpty().withMessage("Full name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chat_id, message_text, user_name, full_name } = req.body;
    try {
      const message = await addMessage(
        chat_id,
        message_text,
        user_name,
        full_name
      );
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error });
    }
  }
);

app.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const user = await findUser(username);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ username: user.username }, secretKey, {
        expiresIn: "6h",
      });
      res.json({
        token,
        user: {
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
        },
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  }
);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.get("/current-user", authenticateToken, async (req, res) => {
  try {
    const user = await findUser(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

app.get("/chats", authenticateToken, async (req, res) => {
  const username = req.user.username;
  try {
    const chats = await findChatsByUsername(username);
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Error fetching chats", error });
  }
});

app.delete(
  "/delete-chat",
  body("chat_id").notEmpty().withMessage("chat_id is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chat_id } = req.body;
    try {
      const chat = await deleteChat(chat_id);
      if (chat.length === 0) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.status(200).json(chat);
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ message: "Error deleting chat", error });
    }
  }
);

app.get(
  "/messages",
  query("chat_id").notEmpty().withMessage("Chat ID is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chat_id } = req.query;
    try {
      const messages = await getMessages(chat_id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages", error });
    }
  }
);

app.get("/user-profile", authenticateToken, async (req, res) => {
  try {
    const user = await findUserProfile(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

app.get("/all-profiles", async (req, res) => {
  try {
    const profiles = await getAllUserProfiles();
    res.json(profiles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profiles", error: error.message });
  }
});

app.get("/usernames", async (req, res) => {
  try {
    const usernames = await getAllUsernames();
    res.json(usernames);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching usernames", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
