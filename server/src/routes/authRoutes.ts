import { Router } from "express";
import {
  completeProfile,
  getAuthState,
  getCurrentUser,
  logout,
  requestCode,
  verifyCode,
} from "../controllers/authController";
import { requireAuthentication, requireOnboardingSession } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/auth/request-code", requestCode);
authRouter.post("/auth/verify-code", verifyCode);
authRouter.post("/auth/complete-profile", requireOnboardingSession, completeProfile);
authRouter.get("/auth/state", getAuthState);
authRouter.get("/auth/me", requireAuthentication, getCurrentUser);
authRouter.post("/auth/logout", requireAuthentication, logout);
