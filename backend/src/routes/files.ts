// src/routes/files.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import multer from "multer";
import FileService from "../services/fileService";
import path from "path";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Upload file route
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const fileMetadata = await FileService.saveFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        userId
      );

      res.status(201).json({
        id: fileMetadata.id,
        originalName: fileMetadata.originalName,
        url: `/api/files/${fileMetadata.id}`,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  }
);

// Get file route
router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileService.getFile(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Ensure file metadata exists
    if (!file.metadata || !file.metadata.mimeType) {
      console.error("Missing file metadata:", file);
      return res.status(500).json({ message: "Invalid file metadata" });
    }

    res.setHeader("Content-Type", file.metadata.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.metadata.originalName}"`
    );
    res.send(file.buffer);
  } catch (error) {
    console.error("File fetch error:", error);
    res.status(500).json({ message: "Failed to retrieve file" });
  }
});

// Delete file route (optional)
router.delete("/:fileId", authenticate, async (req: AuthRequest, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const success = await FileService.deleteFile(fileId);
    if (success) {
      return res.status(200).json({ message: "File deleted successfully" });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

export default router;
