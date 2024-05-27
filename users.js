const bcrypt = require("bcryptjs");
const pool = require("./db");

const addUser = async (username, email, password, fullname) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO users (username, email, password, fullname) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, fullname]
    );
    return result.rows[0];
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
  } finally {
    client.release();
  }
};

module.exports = { addUser, findUser, updateProfilePic, findChatsByUsername };
