// src/config/redis.ts
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));

const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis client connected");
};

export { redisClient, connectRedis };
