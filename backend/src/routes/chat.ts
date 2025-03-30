// src/routes/chat.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import RoomModel from "../models/Room";
import MessageModel from "../models/Message";
import FileService from "../services/fileService";

const router = Router();

// Get all public rooms
router.get("/rooms", authenticate, async (req, res) => {
  try {
    const rooms = await RoomModel.getAll();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new room
router.post("/rooms", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, isPrivate } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await RoomModel.create(name, isPrivate || false, userId);

    // Add creator as member
    if (userId) {
      await RoomModel.addMember(room.id, userId);
    }

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Join a room
router.post(
  "/rooms/:roomId/join",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const room = await RoomModel.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      await RoomModel.addMember(roomId, userId);
      res.status(200).json({ message: "Joined room successfully" });
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get room messages
router.get("/rooms/:roomId/messages", authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const room = await RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await MessageModel.getByRoomId(roomId, limit);

    // Transform the response to include file URLs for image messages
    const transformedMessages = messages.map((msg) => {
      if (msg.message_type === "image" && msg.file_id) {
        return {
          ...msg,
          fileUrl: `/api/files/${msg.file_id}`,
        };
      }
      return msg;
    });

    res.json(transformedMessages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send message with image
router.post(
  "/rooms/:roomId/messages",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const { roomId } = req.params;
      const { content, fileId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const room = await RoomModel.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Check if this user is a member of the room
      const members = await RoomModel.getMembers(roomId);
      if (!members.includes(userId)) {
        return res
          .status(403)
          .json({ message: "You are not a member of this room" });
      }

      const message = await MessageModel.create(
        roomId,
        userId,
        content || "",
        fileId
      );

      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
