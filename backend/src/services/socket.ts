// src/services/socket.ts
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { redisClient } from "../config/redis";
import MessageModel from "../models/Message";
import UserModel from "../models/User";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export default function setupSocketIO(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
      };
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.user.id;
    const username = socket.data.user.username;

    console.log(`User connected: ${username} (${userId})`);

    // Update user's online status
    await UserModel.updateLastSeen(userId);

    // Save socket ID in Redis
    await redisClient.set(`user:${userId}:socket`, socket.id);

    // Join rooms
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${username} joined room ${roomId}`);
    });

    // Handle new messages
    socket.on("send-message", async (data) => {
      try {
        const { roomId, content } = data;

        // Save message to database
        const message = await MessageModel.create(roomId, userId, content);

        // Add username to message
        const messageWithUser = {
          ...message,
          username,
        };

        // Broadcast to room
        io.to(roomId).emit("new-message", messageWithUser);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { roomId } = data;
      socket.to(roomId).emit("user-typing", { userId, username });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${username}`);
      await redisClient.del(`user:${userId}:socket`);
    });
  });

  return io;
}
