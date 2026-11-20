import type { NextFunction, Request, Response } from "express";
import { authCookieName, AuthServiceError, verifyToken } from "../services/authService";

export function readSessionToken(request: Request): string | undefined {
  const authorization = request.header("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  const cookie = request.header("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${authCookieName}=`));

  return cookie?.slice(authCookieName.length + 1);
}

function authenticate(
  request: Request,
  response: Response,
  purpose: "session" | "onboarding",
  next: NextFunction,
): void {
  const token = readSessionToken(request);
  if (!token) {
    response.status(401).json({ success: false, error: "Please sign in to continue." });
    return;
  }

  try {
    const payload = verifyToken(token, purpose);
    if (purpose === "session") {
      const userId = Number(payload.sub);
      if (!Number.isSafeInteger(userId) || userId < 1) {
        response.status(401).json({ success: false, error: "Your session is invalid." });
        return;
      }
      response.locals.userId = userId;
    } else {
      if (typeof payload.phoneNumber !== "string") {
        response.status(401).json({ success: false, error: "Your onboarding session is invalid." });
        return;
      }
      response.locals.phoneNumber = payload.phoneNumber;
    }
    next();
  } catch (error) {
    if (error instanceof AuthServiceError || error instanceof Error) {
      response.status(401).json({ success: false, error: "Your session is invalid or has expired." });
      return;
    }
    next(error);
  }
}

export function requireAuthentication(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  authenticate(request, response, "session", next);
}

export function requireOnboardingSession(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  authenticate(request, response, "onboarding", next);
}
