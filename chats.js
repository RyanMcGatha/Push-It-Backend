const pool = require("./db");

const addChat = async (chat_name, is_group, user_names) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO chats (chat_name, is_group, user_names) VALUES ($1, $2, $3) RETURNING *",
      [chat_name, is_group, user_names]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getMessages = async (chat_id) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM messages WHERE chat_id = $1",
      [chat_id]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const addMessage = async (chat_id, message_text, user_name, full_name) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO messages (chat_id, message_text, user_name, full_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [chat_id, message_text, user_name, full_name]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

module.exports = {
  addChat,
  getMessages,
  addMessage,
};
