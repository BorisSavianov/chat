// src/routes/chat.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import RoomModel from "../models/Room";
import MessageModel from "../models/Message";

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
    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
