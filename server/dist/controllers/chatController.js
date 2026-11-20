"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversation = getConversation;
exports.postConversationMessage = postConversationMessage;
const zod_1 = require("zod");
const chatService_1 = require("../services/chatService");
const paramsSchema = zod_1.z.object({
    matchId: zod_1.z.coerce.number().int().positive(),
});
const querySchema = zod_1.z.object({
    after: zod_1.z.coerce.number().int().nonnegative().optional(),
});
const messageSchema = zod_1.z.object({
    body: zod_1.z.string().trim().min(1).max(1000),
});
function getConversation(request, response) {
    const params = paramsSchema.safeParse(request.params);
    const query = querySchema.safeParse(request.query);
    if (!params.success || !query.success) {
        response.status(400).json({ success: false, error: "Invalid conversation request." });
        return;
    }
    try {
        const messages = (0, chatService_1.getMessages)(params.data.matchId, response.locals.userId, query.data.after);
        response.json({ success: true, messages });
    }
    catch (error) {
        if (error instanceof chatService_1.MatchAccessError) {
            response.status(404).json({ success: false, error: error.message });
            return;
        }
        throw error;
    }
}
function postConversationMessage(request, response) {
    const params = paramsSchema.safeParse(request.params);
    const parsed = messageSchema.safeParse(request.body);
    if (!params.success || !parsed.success) {
        response.status(400).json({
            success: false,
            error: "A message must contain between 1 and 1000 characters.",
            details: parsed.success ? undefined : parsed.error.flatten(),
        });
        return;
    }
    try {
        const message = (0, chatService_1.sendMessage)(params.data.matchId, response.locals.userId, parsed.data.body);
        response.status(201).json({ success: true, message });
    }
    catch (error) {
        if (error instanceof chatService_1.MatchAccessError) {
            response.status(404).json({ success: false, error: error.message });
            return;
        }
        throw error;
    }
}
