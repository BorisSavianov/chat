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

dotenv.config();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = setupSocketIO(server);

// Connect to Redis
connectRedis().catch(console.error);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
