// src/models/Room.ts
import pool from "../config/database";

export interface Room {
  id: string;
  name: string;
  is_private: boolean;
  created_by: string | null;
  created_at: Date;
}

class RoomModel {
  async create(
    name: string,
    isPrivate: boolean,
    createdBy?: string
  ): Promise<Room> {
    const result = await pool.query(
      "INSERT INTO rooms (name, is_private, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name, isPrivate, createdBy || null]
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<Room | null> {
    const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async getAll(): Promise<Room[]> {
    const result = await pool.query(
      "SELECT * FROM rooms WHERE is_private = false"
    );
    return result.rows;
  }

  async addMember(roomId: string, userId: string): Promise<void> {
    await pool.query(
      "INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [roomId, userId]
    );
  }

  async getMembers(roomId: string): Promise<string[]> {
    const result = await pool.query(
      "SELECT user_id FROM room_members WHERE room_id = $1",
      [roomId]
    );

    return result.rows.map((row) => row.user_id);
  }
}

export default new RoomModel();
