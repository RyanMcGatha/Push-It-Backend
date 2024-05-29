require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  addUser,
  findUser,
  updateProfilePic,
  findChatsByUsername,
  findUserProfiles,
  getAllUsernames,
} = require("./users");
const { addChat, getMessages, addMessage } = require("./chats");

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

app.patch("/profile-pic", authenticateToken, async (req, res) => {
  const { username, profilePic } = req.body;
  if (!username || !profilePic) {
    return res
      .status(400)
      .json({ message: "Username and profile picture URL are required" });
  }
  try {
    const updatedUser = await updateProfilePic(username, profilePic);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res
      .status(500)
      .json({ message: "Error updating profile pic", error: error.message });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password, fullname } = req.body;
  if (!username || !email || !password || !fullname) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await addUser(username, email, password, fullname);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

app.post("/add-chat", async (req, res) => {
  const { chat_name, is_group, user_names } = req.body;
  try {
    const chat = await addChat(chat_name, is_group, user_names);
    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Error creating chat", error });
  }
});

app.post("/add-message", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
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
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

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

app.get("/messages", async (req, res) => {
  const { chat_id } = req.query;
  try {
    const messages = await getMessages(chat_id);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

app.get("/user-profiles", authenticateToken, async (req, res) => {
  try {
    const user = await findUserProfiles(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    res.status(500).json({ message: "Error fetching user data", error });
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
