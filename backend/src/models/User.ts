// src/models/User.ts
import pool from "../config/database";
import bcrypt from "bcrypt";

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: Date;
  last_online: Date;
}

class UserModel {
  async create(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at, last_online",
      [username, email, passwordHash]
    );

    return result.rows[0];
  }

  async findByEmail(
    email: string
  ): Promise<(User & { password_hash: string }) | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      "SELECT id, username, email, created_at, last_online FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async updateLastSeen(id: string): Promise<void> {
    await pool.query(
      "UPDATE users SET last_online = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );
  }
}

export default new UserModel();
