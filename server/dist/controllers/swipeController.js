"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSwipe = postSwipe;
const zod_1 = require("zod");
const swipeService_1 = require("../services/swipeService");
const swipeSchema = zod_1.z.object({
    targetUserId: zod_1.z.number().int().positive(),
    action: zod_1.z.enum(["like", "pass"]),
});
function postSwipe(request, response) {
    const parsed = swipeSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Request must include targetUserId and action ('like' or 'pass').",
            details: parsed.error.flatten(),
        });
        return;
    }
    const swiperUserId = response.locals.userId;
    try {
        const result = (0, swipeService_1.recordSwipe)(swiperUserId, parsed.data.targetUserId, parsed.data.action);
        response.status(parsed.data.action === "like" && result.mutualMatchCreated ? 201 : 200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        if (error instanceof swipeService_1.DuplicateSwipeError) {
            response.status(409).json({
                success: false,
                error: error.message,
            });
            return;
        }
        if (error instanceof swipeService_1.InvalidUserError) {
            response.status(400).json({
                success: false,
                error: error.message,
            });
            return;
        }
        if (error instanceof swipeService_1.IncompatibleProfileError) {
            response.status(403).json({
                success: false,
                error: error.message,
            });
            return;
        }
        throw error;
    }
}
