const bcrypt = require("bcryptjs");
const pool = require("./db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const addUser = async (username, email, password, fullname) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO users (username, email, password, fullname, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, hashedPassword, fullname, verificationToken]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  } finally {
    client.release();
  }
};

const findUser = async (username) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  } finally {
    client.release();
  }
};

const findUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  } finally {
    client.release();
  }
};

const generatePasswordResetToken = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: "1h" });

  return token;
};

const findUserByToken = async (token) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by token:", error);
    throw error;
  } finally {
    client.release();
  }
};

const verifyUserEmail = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1",
      [userId]
    );
  } catch (error) {
    console.error("Error verifying user email:", error);
    throw error;
  } finally {
    client.release();
  }
};

const updateProfilePic = async (username, profilePic) => {
  const client = await pool.connect();
  try {
    if (!username || !profilePic) {
      throw new Error("Invalid input: username and profilePic are required");
    }

    const result = await client.query(
      "UPDATE user_profiles SET profile_pic = $1 WHERE username = $2 RETURNING *",
      [profilePic, username]
    );

    if (result.rows.length === 0) {
      throw new Error(`User with username ${username} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  } finally {
    client.release();
  }
};

const findChatsByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM chats WHERE $1 = ANY(user_names)",
      [username]
    );
    return result.rows;
  } catch (error) {
    console.error("Error finding chats by username:", error);
    throw error;
  } finally {
    client.release();
  }
};

const findUserProfile = async (username) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM user_profiles WHERE username = $1",
      [username]
    );
    return result.rows.length ? result.rows[0] : null;
  } catch (error) {
    console.error("Error finding user profile:", error);
    throw error;
  } finally {
    client.release();
  }
};

const getAllUserProfiles = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM user_profiles");
    console.log("All user profiles found:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching all user profiles:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const getAllUsernames = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT username FROM users");
    console.log("All usernames found:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching all usernames:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const updatePassword = async (username, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const client = await pool.connect();
  try {
    const result = await client.query(
      "UPDATE users SET password = $1 WHERE username = $2 RETURNING *",
      [hashedPassword, username]
    );

    if (result.rows.length === 0) {
      throw new Error(`User with username ${username} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
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
  findUserByToken,
  verifyUserEmail,
};
