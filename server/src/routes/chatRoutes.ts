import { Router } from "express";
import { getConversation, postConversationMessage } from "../controllers/chatController";
import { requireAuthentication } from "../middleware/auth";

export const chatRouter = Router();

chatRouter.get("/matches/:matchId/messages", requireAuthentication, getConversation);
chatRouter.post("/matches/:matchId/messages", requireAuthentication, postConversationMessage);
