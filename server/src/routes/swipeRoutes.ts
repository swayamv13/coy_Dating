import { Router } from "express";
import { postSwipe } from "../controllers/swipeController";
import { testUserMiddleware } from "../middleware/testUser";

export const swipeRouter = Router();

swipeRouter.post("/swipes", testUserMiddleware, postSwipe);
swipeRouter.post("/swipe", testUserMiddleware, postSwipe);
