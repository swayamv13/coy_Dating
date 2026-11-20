"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
exports.chatRouter = (0, express_1.Router)();
exports.chatRouter.get("/matches/:matchId/messages", auth_1.requireAuthentication, chatController_1.getConversation);
exports.chatRouter.post("/matches/:matchId/messages", auth_1.requireAuthentication, chatController_1.postConversationMessage);
