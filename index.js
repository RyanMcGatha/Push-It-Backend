require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { addUser, findUser } = require("./users");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY;

app.use(express.json());

app.post("/register", async (req, res) => {
  const { username, email, password, fullname } = req.body;
  try {
    const user = await addUser(username, email, password, fullname);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

app.post("/login", async (req, res) => {
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
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
