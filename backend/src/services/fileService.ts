// src/services/fileService.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- Import this
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database";

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  userId: string;
  createdAt: Date;
}

class FileService {
  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string
  ): Promise<FileMetadata> {
    // Generate unique filename
    const fileExt = path.extname(originalName);
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file to disk
    await fs.promises.writeFile(filePath, buffer);

    // Save metadata to database
    const result = await pool.query(
      `INSERT INTO files (filename, original_name, mime_type, size, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [filename, originalName, mimeType, buffer.length, userId]
    );

    return result.rows[0];
  }

  async getFile(
    fileId: string
  ): Promise<{ metadata: FileMetadata; buffer: Buffer } | null> {
    const result = await pool.query("SELECT * FROM files WHERE id = $1", [
      fileId,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const metadata = result.rows[0];
    const filePath = path.join(UPLOAD_DIR, metadata.filename);

    try {
      const buffer = await fs.promises.readFile(filePath);
      return {
        metadata: {
          id: metadata.id,
          filename: metadata.filename,
          originalName: metadata.original_name, // Convert to camelCase
          mimeType: metadata.mime_type, // Convert to camelCase
          size: metadata.size,
          userId: metadata.user_id, // Convert to camelCase
          createdAt: metadata.created_at,
        },
        buffer,
      };
    } catch (error) {
      console.error(`File not found on disk: ${filePath}`);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const result = await pool.query(
      "SELECT filename FROM files WHERE id = $1",
      [fileId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const filename = result.rows[0].filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    try {
      await fs.promises.unlink(filePath);
      await pool.query("DELETE FROM files WHERE id = $1", [fileId]);
      return true;
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
      return false;
    }
  }
}

export default new FileService();
