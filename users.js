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

module.exports = { addUser, findUser };
