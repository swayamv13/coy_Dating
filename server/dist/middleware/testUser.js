"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUserMiddleware = testUserMiddleware;
const connection_1 = require("../database/connection");
function testUserMiddleware(request, response, next) {
    const headerValue = request.header("x-user-id");
    const queryValue = typeof request.query.userId === "string" ? request.query.userId : undefined;
    const rawUserId = headerValue ?? queryValue ?? "1";
    const userId = Number(rawUserId);
    if (!Number.isInteger(userId) || userId < 1) {
        response.status(400).json({
            success: false,
            error: "The temporary test user ID must be a positive integer.",
        });
        return;
    }
    const user = connection_1.db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!user) {
        response.status(404).json({
            success: false,
            error: "Temporary test user not found.",
        });
        return;
    }
    response.locals.testUserId = userId;
    next();
}
