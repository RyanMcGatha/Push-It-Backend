const pool = require("./db");

const addChat = async (chat_name, is_group, user_names) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "INSERT INTO chats (chat_name, is_group, user_names) VALUES ($1, $2, $3) RETURNING *",
      [chat_name, is_group, user_names]
    );
    return result.rows[0];
  } catch (error) {
    if (error.message.includes("Connection terminated unexpectedly")) {
      throw new Error("Servers are full, please wait");
    } else {
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};

const deleteChat = async (chat_id) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "DELETE FROM chats WHERE chat_id = $1 RETURNING *",
      [chat_id]
    );
    return result.rows;
  } catch (error) {
    if (error.message.includes("Connection terminated unexpectedly")) {
      throw new Error("Servers are full, please wait");
    } else {
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};

const getMessages = async (chat_id) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM messages WHERE chat_id = $1",
      [chat_id]
    );
    return result.rows;
  } catch (error) {
    if (error.message.includes("Connection terminated unexpectedly")) {
      throw new Error("Servers are full, please wait");
    } else {
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};

const addMessage = async (chat_id, message_text, user_name, full_name) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "INSERT INTO messages (chat_id, message_text, user_name, full_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [chat_id, message_text, user_name, full_name]
    );
    return result.rows[0];
  } catch (error) {
    if (error.message.includes("Connection terminated unexpectedly")) {
      throw new Error("Servers are full, please wait");
    } else {
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  addChat,
  getMessages,
  addMessage,
  deleteChat,
};
