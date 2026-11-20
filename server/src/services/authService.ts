import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { db } from "../database/connection";

export const authCookieName = "coy_session";

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
  return crypto.randomBytes(32).toString("base64url");
})();

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export interface NewProfile {
  name: string;
  age: number;
  gender: string;
  lookingFor: string[];
  location: string;
  bio: string;
  interests: string[];
}

function hashCode(phoneNumber: string, code: string): Buffer {
  return crypto.createHmac("sha256", jwtSecret).update(`${phoneNumber}:${code}`).digest();
}

function maskPhone(phoneNumber: string): string {
  return `${phoneNumber.slice(0, 4)}••••${phoneNumber.slice(-2)}`;
}

export function requestPhoneCode(phoneNumber: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new AuthServiceError(
      "Phone-code delivery is not configured. Add an SMS provider before enabling production login.",
      503,
    );
  }

  const now = Date.now();
  const previous = db.prepare(`
    SELECT requested_at FROM otp_challenges WHERE phone_number = ?
  `).get(phoneNumber) as { requested_at: number } | undefined;

  if (previous && now - previous.requested_at < otpCooldownMs) {
    throw new AuthServiceError("Please wait before requesting another code.", 429);
  }

  const code = "12345";
  db.prepare(`
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

function signToken(payload: object, subject: string, expiresIn: number): string {
  return jwt.sign(payload, jwtSecret, {
    algorithm: "HS256",
    audience: "coy-discover",
    issuer: "coy-discover",
    subject,
    expiresIn,
  });
}

export type VerifiedPhoneResult =
  | { kind: "session"; token: string; userId: number }
  | { kind: "onboarding"; token: string; phoneNumber: string };

export function verifyPhoneCode(phoneNumber: string, code: string): VerifiedPhoneResult {
  const challenge = db.prepare(`
    SELECT code_hash, expires_at, attempts
    FROM otp_challenges
    WHERE phone_number = ?
  `).get(phoneNumber) as {
    code_hash: Buffer;
    expires_at: number;
    attempts: number;
  } | undefined;

  if (!challenge || challenge.expires_at <= Date.now()) {
    db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
    throw new AuthServiceError("That code has expired. Request a new one.", 400);
  }

  if (challenge.attempts >= maxOtpAttempts) {
    db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
    throw new AuthServiceError("Too many incorrect attempts. Request a new code.", 429);
  }

  const expected = hashCode(phoneNumber, code);
  const actual = Buffer.from(challenge.code_hash);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    db.prepare(`
      UPDATE otp_challenges SET attempts = attempts + 1 WHERE phone_number = ?
    `).run(phoneNumber);
    throw new AuthServiceError("The verification code is incorrect.", 400);
  }

  db.prepare("DELETE FROM otp_challenges WHERE phone_number = ?").run(phoneNumber);
  const user = db.prepare(`
    SELECT id FROM users WHERE phone_number = ?
  `).get(phoneNumber) as { id: number } | undefined;

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

export function verifyToken(token: string, purpose: "session" | "onboarding"): JwtPayload {
  const payload = jwt.verify(token, jwtSecret, {
    algorithms: ["HS256"],
    audience: "coy-discover",
    issuer: "coy-discover",
  });

  if (typeof payload === "string" || payload.purpose !== purpose) {
    throw new AuthServiceError("Your session is invalid or has expired.", 401);
  }
  return payload;
}

export function createProfileForPhone(phoneNumber: string, profile: NewProfile): number {
  const transaction = db.transaction(() => {
    const email = `${crypto.randomUUID()}@phone.invalid`;
    const insertedUser = db.prepare(`
      INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?)
    `).run(profile.name, email, phoneNumber);
    const userId = Number(insertedUser.lastInsertRowid);

    db.prepare(`
      INSERT INTO profiles
        (user_id, age, gender, bio, location, photo_url, interests, looking_for)
      VALUES (?, ?, ?, ?, ?, '', ?, ?)
    `).run(
      userId,
      profile.age,
      profile.gender,
      profile.bio,
      profile.location,
      JSON.stringify(profile.interests),
      JSON.stringify(profile.lookingFor),
    );

    return userId;
  });

  return transaction();
}

export function createSessionToken(userId: number): string {
  return signToken({ purpose: "session" }, String(userId), sessionLifetimeSeconds);
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  profileComplete: boolean;
}

export function getAuthenticatedUser(userId: number): AuthenticatedUser | null {
  const row = db.prepare(`
    SELECT u.id, u.name, p.user_id IS NOT NULL AS profile_complete
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(userId) as {
    id: number;
    name: string;
    profile_complete: number;
  } | undefined;

  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    profileComplete: Boolean(row.profile_complete),
  };
}

export function getSessionLifetimeMs(): number {
  return sessionLifetimeSeconds * 1000;
}
