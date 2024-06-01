const { Pool } = require("pg");
require("dotenv").config();

// Ensure necessary environment variables are set
if (!process.env.DB_CONNECT) {
  throw new Error("Environment variable DB_CONNECT must be set");
}

// Optional: Check if SSL is configured for production environments
const isProduction = process.env.NODE_ENV === "production";
const sslConfig = isProduction
  ? { rejectUnauthorized: true } // Change to true in production to enforce SSL certificate validation
  : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DB_CONNECT,
  ssl: sslConfig,
  idleTimeoutMillis: 30000, // Automatically terminate idle clients after 30 seconds
  max: 20, // Set the maximum number of clients in the pool to 20
});

// Add error handling for the connection pool
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
