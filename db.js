const { Pool } = require("pg");
require("dotenv").config();

// Ensure necessary environment variables are set
if (!process.env.DB_CONNECT) {
  throw new Error("Environment variable DB_CONNECT must be set");
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sslConfig = {
  rejectUnauthorized: false,
};

const pool = new Pool({
  connectionString: process.env.DB_CONNECT,
  ssl: sslConfig,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Add error handling for the connection pool
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
