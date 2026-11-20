"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceError = exports.authCookieName = void 0;
exports.requestPhoneCode = requestPhoneCode;
exports.verifyPhoneCode = verifyPhoneCode;
exports.verifyToken = verifyToken;
exports.createProfileForPhone = createProfileForPhone;
exports.createSessionToken = createSessionToken;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getSessionLifetimeMs = getSessionLifetimeMs;
const node_crypto_1 = __importDefault(require("node:crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
exports.authCookieName = "coy_session";
const otpLifetimeMs = 5 * 60 * 1000;
const otpCooldownMs = 60 * 1000;
const maxOtpAttempts = 5;
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;
const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (configuredJwtSecret && configuredJwtSecret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
}
const jwtSecret = configuredJwtSecret || (() => {
    if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET must be configured in production.");
    }
    console.warn("JWT_SECRET is unset; using a temporary local-development secret.");
    return node_crypto_1.default.randomBytes(32).toString("base64url");
})();
class AuthServiceError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AuthServiceError = AuthServiceError;
function hashCode(phoneNumber, code) {
    return node_crypto_1.default.createHmac("sha256", jwtSecret).update(`${phoneNumber}:${code}`).digest();
}
function maskPhone(phoneNumber) {
    return `${phoneNumber.slice(0, 4)}••••${phoneNumber.slice(-2)}`;
}
function requestPhoneCode(phoneNumber) {
    if (process.env.NODE_ENV === "production") {
        throw new AuthServiceError("Phone-code delivery is not configured. Add an SMS provider before enabling production login.", 503);
    }
    const now = Date.now();
    const previous = connection_1.db.prepare(`
    SELECT requested_at FROM otp_challenges WHERE phone_number = ?
  `).get(phoneNumber);
    if (previous && now - previous.requested_at < otpCooldownMs) {
        throw new AuthServiceError("Please wait before requesting another code.", 429);
    }
    const code = "12345";
    connection_1.db.prepare(`
    INSERT INTO otp_challenges (phone_number, code_hash, expires_at, attempts, requested_at)
    VALUES (?, ?, ?, 0, ?)
    ON CONFLICT(phone_number) DO UPDATE SET
      code_hash = excluded.code_hash,
      expires_at = excluded.expires_at,
      attempts = 0,
      requested_at = excluded.requested_at
  `).run(phoneNumber, hashCode(phoneNumber, code), now + otpLifetimeMs, now);
    console.info(`[local OTP] ${maskPhone(phoneNumber)}: ${code} (expires in 5 minutes)`);
}
function signToken(payload, subject, expiresIn) {
    return jsonwebtoken_1.default.sign(payload, jwtSecret, {
        algorithm: "HS256",
        audience: "coy-discover",
        issuer: "coy-discover",
        subject,
        expiresIn,
    });
}
function verifyPhoneCode(phoneNumber, code) {
    const challenge = connection_1.db.prepare(`
    SELECT code_hash, expires_at, attempts
    FROM otp_challenges
    WHERE phone_number = ?
  `).get(phoneNumber);
    if (!challenge || challenge.expires_at <= Date.now()) {
        connection_1.db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
        throw new AuthServiceError("That code has expired. Request a new one.", 400);
    }
    if (challenge.attempts >= maxOtpAttempts) {
        connection_1.db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
        throw new AuthServiceError("Too many incorrect attempts. Request a new code.", 429);
    }
    const expected = hashCode(phoneNumber, code);
    const actual = Buffer.from(challenge.code_hash);
    if (actual.length !== expected.length || !node_crypto_1.default.timingSafeEqual(actual, expected)) {
        connection_1.db.prepare(`
      UPDATE otp_challenges SET attempts = attempts + 1 WHERE phone_number = ?
    `).run(phoneNumber);
        throw new AuthServiceError("The verification code is incorrect.", 400);
    }
    connection_1.db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
    const user = connection_1.db.prepare(`
    SELECT id FROM users WHERE phone_number = ?
  `).get(phoneNumber);
    if (user) {
        return {
            kind: "session",
            token: signToken({ purpose: "session" }, String(user.id), sessionLifetimeSeconds),
            userId: user.id,
        };
    }
    return {
        kind: "onboarding",
        token: signToken({ purpose: "onboarding", phoneNumber }, phoneNumber, 10 * 60),
        phoneNumber,
    };
}
function verifyToken(token, purpose) {
    const payload = jsonwebtoken_1.default.verify(token, jwtSecret, {
        algorithms: ["HS256"],
        audience: "coy-discover",
        issuer: "coy-discover",
    });
    if (typeof payload === "string" || payload.purpose !== purpose) {
        throw new AuthServiceError("Your session is invalid or has expired.", 401);
    }
    return payload;
}
function createProfileForPhone(phoneNumber, profile) {
    const transaction = connection_1.db.transaction(() => {
        const email = `${node_crypto_1.default.randomUUID()}@phone.invalid`;
        const insertedUser = connection_1.db.prepare(`
      INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?)
    `).run(profile.name, email, phoneNumber);
        const userId = Number(insertedUser.lastInsertRowid);
        connection_1.db.prepare(`
      INSERT INTO profiles
        (user_id, age, gender, bio, location, photo_url, interests, looking_for)
      VALUES (?, ?, ?, ?, ?, '', ?, ?)
    `).run(userId, profile.age, profile.gender, profile.bio, profile.location, JSON.stringify(profile.interests), JSON.stringify(profile.lookingFor));
        return userId;
    });
    return transaction();
}
function createSessionToken(userId) {
    return signToken({ purpose: "session" }, String(userId), sessionLifetimeSeconds);
}
function getAuthenticatedUser(userId) {
    const row = connection_1.db.prepare(`
    SELECT u.id, u.name, p.user_id IS NOT NULL AS profile_complete
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(userId);
    if (!row)
        return null;
    return {
        id: row.id,
        name: row.name,
        profileComplete: Boolean(row.profile_complete),
    };
}
function getSessionLifetimeMs() {
    return sessionLifetimeSeconds * 1000;
}
