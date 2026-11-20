import type { Request, Response } from "express";
import { z } from "zod";
import { readSessionToken } from "../middleware/auth";
import {
  authCookieName,
  AuthServiceError,
  createProfileForPhone,
  createSessionToken,
  getAuthenticatedUser,
  getSessionLifetimeMs,
  requestPhoneCode,
  verifyToken,
  verifyPhoneCode,
} from "../services/authService";

const phoneSchema = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Enter a phone number with country code.");
const requestCodeSchema = z.object({ phoneNumber: phoneSchema });
const verifyCodeSchema = z.object({
  phoneNumber: phoneSchema,
  code: z.string().trim().regex(/^\d{5}$/, "Enter the 5-digit code."),
});
const profileSchema = z.object({
  name: z.string().trim().min(1).max(35),
  age: z.number().int().min(18).max(99),
  gender: z.string().trim().min(1).max(40),
  lookingFor: z.array(z.enum(["Men", "Women", "Non-binary", "Self-describe", "Everyone"]))
    .min(1).max(5),
  location: z.string().trim().min(1).max(45),
  bio: z.string().trim().max(150).default(""),
  interests: z.array(z.string().trim().min(1).max(30)).max(12),
});

function setSessionCookie(response: Response, token: string, maxAge: number): void {
  response.cookie(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function sendAuthError(response: Response, error: unknown): void {
  if (error instanceof AuthServiceError) {
    response.status(error.statusCode).json({ success: false, error: error.message });
    return;
  }
  throw error;
}

export function requestCode(request: Request, response: Response): void {
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
    requestPhoneCode(parsed.data.phoneNumber);
    response.status(202).json({
      success: true,
      message: "Your local verification code is 12345. No SMS is sent.",
      delivery: "console",
    });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export function verifyCode(request: Request, response: Response): void {
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
    const result = verifyPhoneCode(parsed.data.phoneNumber, parsed.data.code);
    const lifetime = result.kind === "session" ? getSessionLifetimeMs() : 10 * 60 * 1000;
    setSessionCookie(response, result.token, lifetime);

    if (result.kind === "onboarding") {
      response.json({ success: true, profileRequired: true });
      return;
    }

    response.json({ success: true, profileRequired: false });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export function completeProfile(request: Request, response: Response): void {
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
    const userId = createProfileForPhone(response.locals.phoneNumber as string, parsed.data);
    setSessionCookie(response, createSessionToken(userId), getSessionLifetimeMs());
    response.status(201).json({ success: true, user: getAuthenticatedUser(userId) });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      response.status(409).json({
        success: false,
        error: "This phone number already has an account. Sign in with a new verification code.",
      });
      return;
    }
    throw error;
  }
}

export function getCurrentUser(_request: Request, response: Response): void {
  const user = getAuthenticatedUser(response.locals.userId as number);
  if (!user) {
    response.clearCookie(authCookieName, { path: "/" });
    response.status(401).json({ success: false, error: "Your account is no longer available." });
    return;
  }
  response.json({ success: true, user });
}

export function getAuthState(request: Request, response: Response): void {
  const token = readSessionToken(request);
  if (!token) {
    response.json({ success: true, authenticated: false, profileRequired: false });
    return;
  }

  try {
    const payload = verifyToken(token, "session");
    const user = getAuthenticatedUser(Number(payload.sub));
    if (user) {
      response.json({ success: true, authenticated: true, profileRequired: false, user });
      return;
    }
  } catch {
    try {
      verifyToken(token, "onboarding");
      response.json({ success: true, authenticated: false, profileRequired: true });
      return;
    } catch {
      response.clearCookie(authCookieName, { path: "/" });
      response.json({ success: true, authenticated: false, profileRequired: false });
      return;
    }
  }

  response.clearCookie(authCookieName, { path: "/" });
  response.json({ success: true, authenticated: false, profileRequired: false });
}

export function logout(_request: Request, response: Response): void {
  response.clearCookie(authCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.json({ success: true });
}
