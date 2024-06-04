const { Pool } = require("pg");
require("dotenv").config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (!process.env.DB_CONNECT) {
  throw new Error("Environment variable DB_CONNECT not be set");
}

const sslConfig = {
  rejectUnauthorized: false,
};

const pool = new Pool({
  connectionString: process.env.DB_CONNECT,
  ssl: sslConfig,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on("connect", () => {
  console.log("Connected to the database via PgBouncer pool");
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
