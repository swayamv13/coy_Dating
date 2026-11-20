import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { getProfile, updateProfile, updateProfilePhoto } from "../services/profileService";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(35),
  age: z.number().int().min(18).max(99),
  location: z.string().trim().min(1).max(45),
  bio: z.string().trim().min(1).max(150),
  photoCaption: z.string().trim().max(90).default(""),
  interests: z.array(z.string().trim().min(1).max(30)).max(12),
});

export function getCurrentProfile(request: Request, response: Response): void {
  const userId = response.locals.testUserId as number;
  const profile = getProfile(userId);

  if (!profile) {
    response.status(404).json({ success: false, error: "Profile not found." });
    return;
  }

  response.json({ success: true, profile });
}

export function saveCurrentProfile(request: Request, response: Response): void {
  const parsed = profileSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      success: false,
      error: "Invalid profile information.",
      details: parsed.error.flatten(),
    });
    return;
  }

  const userId = response.locals.testUserId as number;
  const profile = updateProfile(userId, parsed.data);

  if (!profile) {
    response.status(404).json({ success: false, error: "Profile not found." });
    return;
  }

  response.json({ success: true, profile });
}

export function saveProfilePhoto(request: Request, response: Response): void {
  if (!request.file) {
    response.status(400).json({ success: false, error: "A photo file is required." });
    return;
  }

  const userId = response.locals.testUserId as number;
  const previousProfile = getProfile(userId);
  const photoUrl = `/uploads/profiles/${request.file.filename}`;
  const profile = updateProfilePhoto(userId, photoUrl);

  if (!profile) {
    fs.unlinkSync(request.file.path);
    response.status(404).json({ success: false, error: "Profile not found." });
    return;
  }

  if (previousProfile?.photoUrl.startsWith("/uploads/profiles/")) {
    const previousPath = path.resolve(
      process.cwd(),
      "public",
      previousProfile.photoUrl.replace(/^\//, ""),
    );
    if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
  }

  response.json({ success: true, profile });
}

export function removeProfilePhoto(request: Request, response: Response): void {
  const userId = response.locals.testUserId as number;
  const profile = getProfile(userId);

  if (!profile) {
    response.status(404).json({ success: false, error: "Profile not found." });
    return;
  }

  if (profile.photoUrl.startsWith("/uploads/profiles/")) {
    const absolutePath = path.resolve(process.cwd(), "public", profile.photoUrl.replace(/^\//, ""));
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  }

  const updated = updateProfilePhoto(userId, "");
  response.json({ success: true, profile: updated });
}
