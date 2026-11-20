"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSessionToken = readSessionToken;
exports.requireAuthentication = requireAuthentication;
exports.requireOnboardingSession = requireOnboardingSession;
const authService_1 = require("../services/authService");
function readSessionToken(request) {
    const authorization = request.header("authorization");
    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice("Bearer ".length);
    }
    const cookie = request.header("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${authService_1.authCookieName}=`));
    return cookie?.slice(authService_1.authCookieName.length + 1);
}
function authenticate(request, response, purpose, next) {
    const token = readSessionToken(request);
    if (!token) {
        response.status(401).json({ success: false, error: "Please sign in to continue." });
        return;
    }
    try {
        const payload = (0, authService_1.verifyToken)(token, purpose);
        if (purpose === "session") {
            const userId = Number(payload.sub);
            if (!Number.isSafeInteger(userId) || userId < 1) {
                response.status(401).json({ success: false, error: "Your session is invalid." });
                return;
            }
            response.locals.userId = userId;
        }
        else {
            if (typeof payload.phoneNumber !== "string") {
                response.status(401).json({ success: false, error: "Your onboarding session is invalid." });
                return;
            }
            response.locals.phoneNumber = payload.phoneNumber;
        }
        next();
    }
    catch (error) {
        if (error instanceof authService_1.AuthServiceError || error instanceof Error) {
            response.status(401).json({ success: false, error: "Your session is invalid or has expired." });
            return;
        }
        next(error);
    }
}
function requireAuthentication(request, response, next) {
    authenticate(request, response, "session", next);
}
function requireOnboardingSession(request, response, next) {
    authenticate(request, response, "onboarding", next);
}
