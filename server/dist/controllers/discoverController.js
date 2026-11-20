"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscover = getDiscover;
const zod_1 = require("zod");
const discoverService_1 = require("../services/discoverService");
const querySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
function getDiscover(request, response) {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Invalid pagination parameters.",
            details: parsed.error.flatten(),
        });
        return;
    }
    const currentUserId = response.locals.userId;
    const { limit, offset } = parsed.data;
    const result = (0, discoverService_1.getDiscoverProfiles)(currentUserId, limit, offset);
    response.json({
        success: true,
        profiles: result.profiles,
        pagination: {
            limit,
            offset,
            total: result.total,
            hasMore: offset + result.profiles.length < result.total,
        },
    });
}
