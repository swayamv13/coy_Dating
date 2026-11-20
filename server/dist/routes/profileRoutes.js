"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const profileController_1 = require("../controllers/profileController");
const uploadDirectory = node_path_1.default.resolve(process.cwd(), "public", "uploads", "profiles");
node_fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
        const extension = node_path_1.default.extname(file.originalname).toLowerCase();
        callback(null, `${node_crypto_1.default.randomBytes(16).toString("hex")}${extension}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error("Only JPEG, PNG, and WebP images are allowed."));
        }
    },
});
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.get("/profile", auth_1.requireAuthentication, profileController_1.getCurrentProfile);
exports.profileRouter.put("/profile", auth_1.requireAuthentication, profileController_1.saveCurrentProfile);
exports.profileRouter.post("/profile/photo", auth_1.requireAuthentication, upload.single("photo"), profileController_1.saveProfilePhoto);
exports.profileRouter.delete("/profile/photo", auth_1.requireAuthentication, profileController_1.removeProfilePhoto);
