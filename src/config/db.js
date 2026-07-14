import pg from "pg";
import ENV from "../utils/env.js";

const { Pool } = pg;

const db = new Pool({
  connectionString: ENV.database_url, 
  ssl: ENV.server.node_env === "production" ? { rejectUnauthorized: false } : false,
});

const checkConnection = async () => {
  try {
    const client = await db.connect();
    console.log(`Database connected successfully`);
    client.release();
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export { db as default, checkConnection };