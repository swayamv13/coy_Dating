"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCode = requestCode;
exports.verifyCode = verifyCode;
exports.completeProfile = completeProfile;
exports.getCurrentUser = getCurrentUser;
exports.getAuthState = getAuthState;
exports.logout = logout;
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const authService_1 = require("../services/authService");
const phoneSchema = zod_1.z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Enter a phone number with country code.");
const requestCodeSchema = zod_1.z.object({ phoneNumber: phoneSchema });
const verifyCodeSchema = zod_1.z.object({
    phoneNumber: phoneSchema,
    code: zod_1.z.string().trim().regex(/^\d{5}$/, "Enter the 5-digit code."),
});
const profileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(35),
    age: zod_1.z.number().int().min(18).max(99),
    gender: zod_1.z.string().trim().min(1).max(40),
    lookingFor: zod_1.z.array(zod_1.z.enum(["Men", "Women", "Non-binary", "Self-describe", "Everyone"]))
        .min(1).max(5),
    location: zod_1.z.string().trim().min(1).max(45),
    bio: zod_1.z.string().trim().max(150).default(""),
    interests: zod_1.z.array(zod_1.z.string().trim().min(1).max(30)).max(12),
});
function setSessionCookie(response, token, maxAge) {
    response.cookie(authService_1.authCookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
    });
}
function sendAuthError(response, error) {
    if (error instanceof authService_1.AuthServiceError) {
        response.status(error.statusCode).json({ success: false, error: error.message });
        return;
    }
    throw error;
}
function requestCode(request, response) {
    const parsed = requestCodeSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Enter a valid phone number in international format, including its country code.",
            details: parsed.error.flatten(),
        });
        return;
    }
    try {
        (0, authService_1.requestPhoneCode)(parsed.data.phoneNumber);
        response.status(202).json({
            success: true,
            message: "Your local verification code is 12345. No SMS is sent.",
            delivery: "console",
        });
    }
    catch (error) {
        sendAuthError(response, error);
    }
}
function verifyCode(request, response) {
    const parsed = verifyCodeSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Enter your phone number and the 5-digit verification code.",
            details: parsed.error.flatten(),
        });
        return;
    }
    try {
        const result = (0, authService_1.verifyPhoneCode)(parsed.data.phoneNumber, parsed.data.code);
        const lifetime = result.kind === "session" ? (0, authService_1.getSessionLifetimeMs)() : 10 * 60 * 1000;
        setSessionCookie(response, result.token, lifetime);
        if (result.kind === "onboarding") {
            response.json({ success: true, profileRequired: true });
            return;
        }
        response.json({ success: true, profileRequired: false });
    }
    catch (error) {
        sendAuthError(response, error);
    }
}
function completeProfile(request, response) {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json({
            success: false,
            error: "Please check your profile details.",
            details: parsed.error.flatten(),
        });
        return;
    }
    try {
        const userId = (0, authService_1.createProfileForPhone)(response.locals.phoneNumber, parsed.data);
        setSessionCookie(response, (0, authService_1.createSessionToken)(userId), (0, authService_1.getSessionLifetimeMs)());
        response.status(201).json({ success: true, user: (0, authService_1.getAuthenticatedUser)(userId) });
    }
    catch (error) {
        if (error instanceof Error &&
            "code" in error &&
            error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            response.status(409).json({
                success: false,
                error: "This phone number already has an account. Sign in with a new verification code.",
            });
            return;
        }
        throw error;
    }
}
function getCurrentUser(_request, response) {
    const user = (0, authService_1.getAuthenticatedUser)(response.locals.userId);
    if (!user) {
        response.clearCookie(authService_1.authCookieName, { path: "/" });
        response.status(401).json({ success: false, error: "Your account is no longer available." });
        return;
    }
    response.json({ success: true, user });
}
function getAuthState(request, response) {
    const token = (0, auth_1.readSessionToken)(request);
    if (!token) {
        response.json({ success: true, authenticated: false, profileRequired: false });
        return;
    }
    try {
        const payload = (0, authService_1.verifyToken)(token, "session");
        const user = (0, authService_1.getAuthenticatedUser)(Number(payload.sub));
        if (user) {
            response.json({ success: true, authenticated: true, profileRequired: false, user });
            return;
        }
    }
    catch {
        try {
            (0, authService_1.verifyToken)(token, "onboarding");
            response.json({ success: true, authenticated: false, profileRequired: true });
            return;
        }
        catch {
            response.clearCookie(authService_1.authCookieName, { path: "/" });
            response.json({ success: true, authenticated: false, profileRequired: false });
            return;
        }
    }
    response.clearCookie(authService_1.authCookieName, { path: "/" });
    response.json({ success: true, authenticated: false, profileRequired: false });
}
function logout(_request, response) {
    response.clearCookie(authService_1.authCookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
    response.json({ success: true });
}
