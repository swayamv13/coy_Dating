"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentProfile = getCurrentProfile;
exports.saveCurrentProfile = saveCurrentProfile;
exports.saveProfilePhoto = saveProfilePhoto;
exports.removeProfilePhoto = removeProfilePhoto;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const zod_1 = require("zod");
const profileService_1 = require("../services/profileService");
const profileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(35),
    age: zod_1.z.number().int().min(18).max(99),
    gender: zod_1.z.string().trim().min(1).max(40),
    lookingFor: zod_1.z.array(zod_1.z.enum(["Men", "Women", "Non-binary", "Self-describe", "Everyone"]))
        .min(1).max(5),
    location: zod_1.z.string().trim().min(1).max(45),
    bio: zod_1.z.string().trim().max(150).default(""),
    photoCaption: zod_1.z.string().trim().max(90).default(""),
    interests: zod_1.z.array(zod_1.z.string().trim().min(1).max(30)).max(12),
});
function getCurrentProfile(request, response) {
    const userId = response.locals.userId;
    const profile = (0, profileService_1.getProfile)(userId);
    if (!profile) {
        response.status(404).json({ success: false, error: "Profile not found." });
        return;
    }
    response.json({ success: true, profile });
}
function saveCurrentProfile(request, response) {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Invalid profile information.",
            details: parsed.error.flatten(),
        });
        return;
    }
    const userId = response.locals.userId;
    const profile = (0, profileService_1.updateProfile)(userId, parsed.data);
    if (!profile) {
        response.status(404).json({ success: false, error: "Profile not found." });
        return;
    }
    response.json({ success: true, profile });
}
function saveProfilePhoto(request, response) {
    if (!request.file) {
        response.status(400).json({ success: false, error: "A photo file is required." });
        return;
    }
    const userId = response.locals.userId;
    const previousProfile = (0, profileService_1.getProfile)(userId);
    const photoUrl = `/uploads/profiles/${request.file.filename}`;
    const profile = (0, profileService_1.updateProfilePhoto)(userId, photoUrl);
    if (!profile) {
        node_fs_1.default.unlinkSync(request.file.path);
        response.status(404).json({ success: false, error: "Profile not found." });
        return;
    }
    if (previousProfile?.photoUrl.startsWith("/uploads/profiles/")) {
        const previousPath = node_path_1.default.resolve(process.cwd(), "public", previousProfile.photoUrl.replace(/^\//, ""));
        if (node_fs_1.default.existsSync(previousPath))
            node_fs_1.default.unlinkSync(previousPath);
    }
    response.json({ success: true, profile });
}
function removeProfilePhoto(request, response) {
    const userId = response.locals.userId;
    const profile = (0, profileService_1.getProfile)(userId);
    if (!profile) {
        response.status(404).json({ success: false, error: "Profile not found." });
        return;
    }
    if (profile.photoUrl.startsWith("/uploads/profiles/")) {
        const absolutePath = node_path_1.default.resolve(process.cwd(), "public", profile.photoUrl.replace(/^\//, ""));
        if (node_fs_1.default.existsSync(absolutePath))
            node_fs_1.default.unlinkSync(absolutePath);
    }
    const updated = (0, profileService_1.updateProfilePhoto)(userId, "");
    response.json({ success: true, profile: updated });
}
