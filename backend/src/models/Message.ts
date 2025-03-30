// src/models/Message.ts
import pool from "../config/database";

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  file_id: string | null;
  message_type: "text" | "image";
  created_at: Date;
  username?: string;
}

class MessageModel {
  async create(
    roomId: string,
    senderId: string,
    content: string,
    fileId?: string
  ): Promise<Message> {
    const messageType = fileId ? "image" : "text";

    const result = await pool.query(
      `INSERT INTO messages (room_id, sender_id, content, file_id, message_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [roomId, senderId, content, fileId || null, messageType]
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
