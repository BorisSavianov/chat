// src/config/database.ts
import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "chatapp",
});

export default pool;
