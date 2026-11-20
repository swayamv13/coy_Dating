import { Router } from "express";
import { postSwipe } from "../controllers/swipeController";
import { requireAuthentication } from "../middleware/auth";

export const swipeRouter = Router();

swipeRouter.post("/swipes", requireAuthentication, postSwipe);
swipeRouter.post("/swipe", requireAuthentication, postSwipe);
