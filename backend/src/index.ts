// src/index.ts
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectRedis } from "./config/redis";
import setupSocketIO from "./services/socket";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import fileRoutes from "./routes/files";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = setupSocketIO(server);

// Connect to Redis
connectRedis().catch(console.error);

// Middleware
// Update the CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Adjust this to match your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow serving uploaded files
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/files", fileRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
