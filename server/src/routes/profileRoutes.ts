import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { Router } from "express";
import { requireAuthentication } from "../middleware/auth";
import {
  getCurrentProfile,
  removeProfilePhoto,
  saveCurrentProfile,
  saveProfilePhoto,
} from "../controllers/profileController";

const uploadDirectory = path.resolve(process.cwd(), "public", "uploads", "profiles");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomBytes(16).toString("hex")}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }
  },
});

export const profileRouter = Router();

profileRouter.get("/profile", requireAuthentication, getCurrentProfile);
profileRouter.put("/profile", requireAuthentication, saveCurrentProfile);
profileRouter.post("/profile/photo", requireAuthentication, upload.single("photo"), saveProfilePhoto);
profileRouter.delete("/profile/photo", requireAuthentication, removeProfilePhoto);
