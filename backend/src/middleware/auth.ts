// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
