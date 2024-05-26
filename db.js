const { Pool } = require("pg");
require("dotenv").config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
  connectionString: process.env.DB_CONNECT,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
