import type { Request, Response } from "express";
import { getMatchesForUser } from "../services/matchService";

export function getMatches(request: Request, response: Response): void {
  const userId = response.locals.testUserId as number;
  const matches = getMatchesForUser(userId);

  response.json({
    success: true,
    matches,
  });
}
