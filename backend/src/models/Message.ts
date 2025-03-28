// src/models/Message.ts
import pool from "../config/database";

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: Date;
  username?: string;
}

class MessageModel {
  async create(
    roomId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const result = await pool.query(
      "INSERT INTO messages (room_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
      [roomId, senderId, content]
    );

    return result.rows[0];
  }

  async getByRoomId(roomId: string, limit = 50): Promise<Message[]> {
    const result = await pool.query(
      `SELECT m.*, u.username 
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [roomId, limit]
    );

    return result.rows;
  }
}

export default new MessageModel();
